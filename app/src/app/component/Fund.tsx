"use client"

import { Button, Image, Input, notification } from 'antd'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import tokenList from '@/app/assets/data/tokens.json'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import BigNumber from "bignumber.js";
import { CONSTANT_PRODUCT_TICKET_TO_RATIO, deriveLiquidityPoolPDA, fetchPoolData, fundPool, numberWDecimals, numberWODecimals } from '../utils'
import { Account as TokenAccount, getAccount, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey, Transaction } from '@solana/web3.js'
import { createWrappedSolanaIfNeeded } from '../utils/createWrappedSolana'
import { confirmTransactionFromFrontend, verifyTransaction } from '../utils/transactionSigner'
import { asyncInitAccount } from '../utils/initAccount'

function Fund() {
    const { connected, publicKey, wallet, signTransaction } = useWallet();
    const { connection } = useConnection();

    const [tokenOneAmount, setTokenOneAmount] = useState<string | undefined>(undefined);
    const [tokenTwoAmount, setTokenTwoAmount] = useState<string | undefined>(undefined);
    const [poolData, setPoolData] = useState<TokenAccount[]>([]);
    const [errorMsg, setErrorMsg] = useState<string>('');

    const tokenOne = tokenList[0];
    const tokenTwo = tokenList[1];
    // @ts-ignore
    const constantProductRatio = useMemo(() => CONSTANT_PRODUCT_TICKET_TO_RATIO[tokenTwo.ticker], [tokenTwo.ticker]);
    const tokenOneInPool = poolData.find((asset) => tokenOne.address === asset.mint.toString());
    const tokenTwoInPool = poolData.find((asset) => tokenTwo.address === asset.mint.toString());

    const onChangeAmount = (_value: string, ticker: string) => {
        let value = Number(_value);
        if (isNaN(value) || value < 0) {
            _value = ''
        }
        let newTokenOneAmount = _value;
        let newTokenTwoAmount = _value;
        if (ticker === "SOL") {
            newTokenTwoAmount = (Number(newTokenOneAmount) / constantProductRatio).toLocaleString();
        } else {
            newTokenOneAmount = (Number(newTokenTwoAmount) * constantProductRatio).toLocaleString();
        }
        setTokenOneAmount(newTokenOneAmount);
        setTokenTwoAmount(newTokenTwoAmount);
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

    const onFundPool = async () => {
        // check balance of 2 mints
        if (!tokenOneAmount || !tokenTwoAmount || tokenOneAmount === '0' || tokenTwoAmount === '0') {
            notification.error({
                message: 'Please enter a valid amount',
            })
            return;
        }
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
        const neededBalanceTokenOne = numberWDecimals(tokenOneAmount, tokenOne.decimals);
        const wrapSolError = await createWrappedSolanaIfNeeded(
            connection,
            publicKey as PublicKey,
            neededBalanceTokenOne,
            { wallet, signTransaction }
        )
        if (wrapSolError) {
            notification.error(wrapSolError)
            return;
        }

        const tokenTwoAta = getAssociatedTokenAddressSync(new PublicKey(tokenTwo.address), publicKey as PublicKey)
        const tokenAccount = await getAccount(connection, tokenTwoAta).catch(() => ({ amount: 0 }))
        const neededBalanceTokenTwo = numberWDecimals(tokenTwoAmount, tokenTwo.decimals);
        const isNotEnoughToken = neededBalanceTokenTwo
            .isGreaterThan(new BigNumber(tokenAccount.amount.toString()));
        if (isNotEnoughToken) {
            notification.error({
                message: `Not enough ${tokenTwo.ticker}`,
            })
            return;
        }

        // fund pool
        const poolAddress = deriveLiquidityPoolPDA();
        const ltsBlock = await connection.getLatestBlockhash();
        const tx = new Transaction({
            ...ltsBlock,
            feePayer: publicKey
        }).add(
            await fundPool(
                connection, publicKey as PublicKey,
                poolAddress, new PublicKey(tokenOne.address), 
                neededBalanceTokenOne.toString()
            ),
            await fundPool(
                connection, publicKey as PublicKey,
                poolAddress, new PublicKey(tokenTwo.address),
                neededBalanceTokenTwo.toString()
            )
        )
        const txSignature = await confirmTransactionFromFrontend(connection, tx, {
            wallet, signTransaction
        })
        const isFundFailed = await verifyTransaction(connection, txSignature)
        if (isFundFailed) {
            notification.error({
                message: "Failed to Fund",
            })
            return;
        }
        notification.success({
            message: `Fund Pool Successfully`,
            description: <a href={`https://solscan.io/tx/${txSignature}?cluster=devnet`} target="_blank">View the transaction</a>
        })
        await onFetchPoolData();
    }

    return (
        <>
            <div 
                className='w-[600px] bg-[#0E111B] border-[2px] border-[#21273a] min-h-[300px] rounded-xl flex flex-col justify-start items-start pl-7 pr-7 py-2'
            >
                <div className="flex justify-center items-center w-full mb-5">
                    <h2 className='text-3xl'>
                        Funding
                    </h2>
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
                            onChangeAmount(e.target.value, tokenOne.ticker)
                        }}
                    />
                    <Input 
                        placeholder="0"
                        value={tokenTwoAmount}
                        onChange={(e) => {
                            onChangeAmount(e.target.value, tokenTwo.ticker)
                        }}
                    />
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

                <Button
                    className="flex justify-center items-center bg-[#243056] w-full h-[55px] text-[20px] rounded-[12px] text-[#5981F3] font-bold transition-all duration-300 mb-7 mt-2"
                    disabled={!tokenOneAmount || !tokenTwoAmount || !connected}
                    onClick={onFundPool}
                >Fund</Button>
            </div>
        </>
    )
}

export default Fund