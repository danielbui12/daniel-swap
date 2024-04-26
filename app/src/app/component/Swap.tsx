"use client"

import { Button, Image, Input, Switch, notification } from 'antd'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import tokenList from '@/app/assets/data/tokens.json'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { ArrowDownOutlined } from '@ant-design/icons'
import BigNumber from "bignumber.js";
import { CONSTANT_PRICE_TICKET_TO_RATIO, CONSTANT_PRODUCT_TICKET_TO_RATIO, deriveLiquidityPoolPDA, fetchPoolData, numberWDecimals, numberWODecimals, swapUsingConstantPriceFormula, swapUsingConstantProductFormula } from '../utils'
import {Account as TokenAccount, getAccount, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey } from '@solana/web3.js'
import { createWrappedSolanaIfNeeded } from '../utils/createWrappedSolana'
import { confirmTransactionInstruction, verifyTransaction } from '../utils/transactionSigner'
import { asyncInitAccount } from '../utils/initAccount'

function Swap() {
    const { connected, publicKey, wallet, signTransaction } = useWallet();
    const { connection } = useConnection();

    const [tokenOneAmount, setTokenOneAmount] = useState<string | undefined>(undefined);
    const [tokenTwoAmount, setTokenTwoAmount] = useState<string | undefined>(undefined);
    const [tokenOne, setTokenOne] = useState(tokenList[0]);
    const [tokenTwo, setTokenTwo] = useState(tokenList[1]);
    const [poolData, setPoolData] = useState<TokenAccount[]>([]);
    const [isUsingConstantProduct, setIsUsingConstantProduct] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [constantProductPriceImpact, setConstantProductPriceImpact] = useState<string>('');
    // @ts-ignore
    const constantPriceRatio = useMemo(() => CONSTANT_PRICE_TICKET_TO_RATIO[tokenOne.ticker], [tokenOne.ticker]);
    // @ts-ignore
    const constantProductRatio = useMemo(() => CONSTANT_PRODUCT_TICKET_TO_RATIO[tokenTwo.ticker], [tokenTwo.ticker]);
    
    const tokenOneInPool = poolData.find((asset) => tokenOne.address === asset.mint.toString());
    const tokenTwoInPool = poolData.find((asset) => tokenTwo.address === asset.mint.toString());

    const onChangeAmount = (value: string, _isUsingConstantProduct = isUsingConstantProduct) => {
        if (errorMsg) setErrorMsg('')
        if (constantProductPriceImpact) setConstantProductPriceImpact('')

        setTokenOneAmount(value);
        if (!value) {
            setTokenTwoAmount(undefined);
            return;
        }
        const amountWDecimals = numberWDecimals(value, tokenOne.decimals);
        if (!_isUsingConstantProduct) {
            const numerator = new BigNumber(constantPriceRatio[0]);
            const denominator = new BigNumber(constantPriceRatio[1])
            const receivingAmount = amountWDecimals.multipliedBy(numerator).div(denominator);
            const normalizedAmount = numberWODecimals(receivingAmount, tokenTwo.decimals)          
            setTokenTwoAmount(normalizedAmount.toString())
        } else {
            const big_b = new BigNumber(tokenTwoInPool?.amount?.toString() || "0");
            const big_a = new BigNumber(tokenOneInPool?.amount?.toString() || "0");
            const a = amountWDecimals;

            const bigb_times_a = big_b.multipliedBy(a);
            const biga_plus_a = big_a.plus(a);
            const b = bigb_times_a.dividedBy(biga_plus_a);
            
            // Validate not exceed amount in pool
            if (b.isGreaterThan(big_b)) {
                setErrorMsg("Over liquidity allocatable!");
            }
            setTokenTwoAmount(numberWODecimals(b, tokenTwo.decimals).toFixed(4))

            const diff = amountWDecimals.dividedBy(b)
            const original = constantProductRatio
            const priceImpact = diff.minus(original).dividedBy(original).multipliedBy(100);
            
            setConstantProductPriceImpact(
                "Price Impact: " + (priceImpact.toNumber() >= 100 ? "> 99.99" : priceImpact.toFixed(2)) + "%"
            )
        }
    }

    function switchTokens() {
        setTokenOneAmount(undefined);
        setTokenTwoAmount(undefined);
        errorMsg && setErrorMsg('')
        constantProductPriceImpact && setConstantProductPriceImpact('')
        const one = tokenOne;
        const two = tokenTwo;
        setTokenOne(two);
        setTokenTwo(one);
    }
    
    const onFetchPoolData = useCallback(async () => {
            const poolAddress = deriveLiquidityPoolPDA()
            const poolData = await fetchPoolData(connection, poolAddress)
                .catch((err) => {
                    console.error('fetch pool failed:', err);
                    return [];
                });
            if (poolData.length > 0) {
                setPoolData(poolData)
            }
    }, [connection])

    useEffect(() => {
        onFetchPoolData()
    }, [onFetchPoolData])

    const onSwap = async () => {
        try {
            const isFailed = await asyncInitAccount(
                [
                    new PublicKey(tokenOne.address),
                    new PublicKey(tokenTwo.address),
                ],
                connection,
                publicKey as PublicKey,
                {
                    wallet, signTransaction,
                    publicKey: publicKey as PublicKey,
                }
            );
            if (isFailed) {
                notification.error({
                    message: 'Failed to init account',
                })
            }
            const swapAmount = numberWDecimals(Number(tokenOneAmount), tokenOne.decimals);
            const tokenOnePublicKey = new PublicKey(tokenOne.address);
            const ata = getAssociatedTokenAddressSync(tokenOnePublicKey, publicKey as PublicKey);
            const tokenAccount = await getAccount(connection, ata)
            const isNotEnoughToken = swapAmount.isGreaterThan(new BigNumber(tokenAccount.amount.toString()));
            
            if (tokenOne.address === tokenList[0].address) {
                // wSOL
                const error = await createWrappedSolanaIfNeeded(
                    connection,
                    publicKey as PublicKey,
                    swapAmount,
                    { wallet, signTransaction }
                )
                if (error) {
                    notification.error(error)
                    return;
                }
            } else if (isNotEnoughToken) {
                // not enough MOVE
                notification.error({
                    message: "Not enough MOVE",
                })
                return;
            }

            /// sending transaction
            const poolAddress = deriveLiquidityPoolPDA()
            const swapIx = await (
                isUsingConstantProduct ? 
                    swapUsingConstantProductFormula :
                    swapUsingConstantPriceFormula
            )(
                connection, publicKey as PublicKey,
                poolAddress, new PublicKey(tokenTwo.address),
                new PublicKey(tokenOne.address), swapAmount.toString(),
            );
            const swapTxSignature = await confirmTransactionInstruction(connection, swapIx, {
                wallet,
                signTransaction,
                publicKey: publicKey as PublicKey
            });
            const isSwapFailed = await verifyTransaction(connection, swapTxSignature)
            if (isSwapFailed) {
                notification.error({
                    message: "Failed to Swap",
                })
                return;
            }
            notification.success({
                message: `Swap from ${tokenOne.ticker} to ${tokenTwo.ticker} Successfully`,
                description: <a href={`https://solscan.io/tx/${swapTxSignature}?cluster=devnet`} target="_blank">View the transaction</a>
            })
            await onFetchPoolData();
        } catch (error: any) {
            if (error.message === "User rejected the request.") {
                return;
            }
            console.log({error});
            notification.error({
                message: "Unknown error",
            })
        }
    }

    // const settings = (
    //     <>
    //         <div>Slippage Tolerance</div>
    //         <div>
    //             <Radio.Group value={slippage} onChange={handleSlippageChange}>
    //                 <Radio.Button value={0.5}>0.5%</Radio.Button>
    //                 <Radio.Button value={2.5}>2.5%</Radio.Button>
    //                 <Radio.Button value={5}>5.0%</Radio.Button>
    //             </Radio.Group>
    //         </div>
    //     </>
    // );

    return (
        <>
            <div 
                className='w-[600px] bg-[#0E111B] border-[2px] border-[#21273a] min-h-[300px] rounded-xl flex flex-col justify-start items-start pl-7 pr-7 py-2'
            >
                <div className="flex justify-between items-center w-full mb-5">
                    <h2 className='text-3xl'>
                        Swap
                    </h2>
                    <Switch 
                        checkedChildren="Constant Product"
                        unCheckedChildren="Constant Price"
                        value={isUsingConstantProduct}
                        onChange={(val) => {
                            setIsUsingConstantProduct(val)
                            if (tokenOneAmount) onChangeAmount(tokenOneAmount, val)
                        }}
                    />
                    {/* <Popover
                        content={settings}
                        title="Settings"
                        trigger="click"
                        placement="bottomRight"
                    >
                        <SettingOutlined className="cog" />
                    </Popover> */}
                </div>
                <div className='flex justify-center w-full'>
                    {
                        poolData.length > 0 ? (
                            <span className='text-xl my-2'>
                                ({tokenOne.ticker})&nbsp;
                                {numberWODecimals(tokenOneInPool?.amount?.toString() || '0', tokenOne.decimals).toFixed(4)} &nbsp;
                                / &nbsp;
                                ({tokenTwo.ticker}) &nbsp;
                                {numberWODecimals(tokenTwoInPool?.amount?.toString() || '0', tokenTwo.decimals).toFixed(4)}
                            </span>
                        ) : (<></>)
                    }
                </div>
                <div className='relative'>
                    <Input
                        placeholder="0"
                        value={tokenOneAmount}
                        onChange={(e) => {
                            let val = Number(e.target.value);
                            if (isNaN(val) || val < 0) {
                                e.target.value = '0'
                            }
                            onChangeAmount(e.target.value)
                        }}
                    />
                    <Input placeholder="0" value={tokenTwoAmount} disabled={true} />
                    <div 
                        className='bg-[#3a4157] w-[25px] h-[25px] items-center justify-center flex rounded-[8px] absolute top-[86px] left-[180px] text-[#5F6783] border-[3px] border-[#0E111B] text-[12px] transition-all duration-300 hover:text-white hover:cursor-pointer'
                        onClick={switchTokens}
                    >
                        <ArrowDownOutlined />
                    </div>
                    <div 
                        className='absolute min-w-[50px] h-[30px] bg-[#3a4157] top-[36px] right-[20px] rounded-full flex justify-start items-center space-x-1 font-bold text-[17px] pr-2'
                    >
                        <Image 
                            src={tokenOne.img} 
                            alt={tokenOne.name}
                            style={{
                                height: 30,
                                width: 30,
                                borderRadius: '50%',
                                marginLeft: 5
                            }}
                        />&nbsp;
                        {tokenOne.ticker}
                    </div>
                    <div 
                        className='absolute min-w-[50px] h-[30px] bg-[#3a4157] top-[135px] right-[20px] rounded-full flex justify-start items-center space-x-1 font-bold text-[17px] pr-2'
                    >
                        <Image 
                            src={tokenTwo.img}
                            alt="assetOneLogo"
                            style={{
                                height: 30,
                                width: 30,
                                borderRadius: '50%',
                                marginLeft: 5
                            }}
                        />&nbsp;
                        {tokenTwo.ticker}
                    </div>
                </div>
                <div className='text-red-700'>{errorMsg}</div>
                <div className='text-red-700'>{constantProductPriceImpact}</div>

                <Button
                    className="flex justify-center items-center bg-[#243056] w-full h-[55px] text-[20px] rounded-[12px] text-[#5981F3] font-bold transition-all duration-300 mb-7 mt-2"
                    disabled={!tokenOneAmount || !connected}
                    onClick={onSwap}
                >Swap</Button>
            </div>
        </>
    )
}

export default Swap