"use client"

import { Button, Image, Input } from 'antd'
import React, { useState } from 'react'
import tokenList from '@/app/assets/data/tokens.json'
import { useWallet } from '@solana/wallet-adapter-react'
import { ArrowDownOutlined } from '@ant-design/icons'
import BigNumber from "bignumber.js";
import { numberWDecimals, numberWODecimals } from '../utils'

BigNumber.set({ DECIMAL_PLACES: 10, ROUNDING_MODE: 4 })

type NumberState = number | undefined;

const TICKET_TO_RATIO = {
    "SOL": [10, 1],
    "MOVE": [1, 10],
}

function Swap() {
    const { connected } = useWallet();

    const [tokenOneAmount, setTokenOneAmount] = useState<NumberState>(undefined);
    const [tokenTwoAmount, setTokenTwoAmount] = useState<NumberState>(undefined);
    const [tokenOne, setTokenOne] = useState(tokenList[0]);
    const [tokenTwo, setTokenTwo] = useState(tokenList[1]);
    // @ts-ignore
    const [ratio, setRatio] = useState<undefined | [number, number]>(TICKET_TO_RATIO[tokenOne.ticker]);

    const onChangeAmount = (e: any) => {
        setTokenOneAmount(e.target.value);
        if (e.target.value && ratio) {
            const amountWDecimals = numberWDecimals(e.target.value, tokenOne.decimals);
            const numerator = new BigNumber(ratio[0]);
            const denominator = new BigNumber(ratio[1])
            const receivingAmount = amountWDecimals.multipliedBy(numerator).div(denominator);
            const normalizedAmount = numberWODecimals(receivingAmount, tokenTwo.decimals)          
            setTokenTwoAmount(normalizedAmount)
        } else {
            setTokenTwoAmount(undefined);
        }
    }

    function switchTokens() {
        setTokenOneAmount(undefined);
        setTokenTwoAmount(undefined);
        const one = tokenOne;
        const two = tokenTwo;
        // 1 SOL = 100 MOVE
        // @ts-ignore
        setRatio(TICKET_TO_RATIO[two.ticker]);
        setTokenOne(two);
        setTokenTwo(one);
        // fetchPrices(two.address, one.address);
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
                className='w-[500px] bg-[#0E111B] border-[2px] border-[#21273a] min-h-[300px] rounded-xl flex flex-col justify-start items-start pl-7 pr-7 py-2'
            >
                <div className="flex justify-center items-center w-full">
                    <h2 className='text-3xl'>
                        Swap
                    </h2>
                    {/* <Popover
                        content={settings}
                        title="Settings"
                        trigger="click"
                        placement="bottomRight"
                    >
                        <SettingOutlined className="cog" />
                    </Popover> */}
                </div>
                <div
                    style={{
                        position: 'relative'
                    }}
                >
                    <Input
                        placeholder="0"
                        type='number'
                        value={tokenOneAmount}
                        onChange={onChangeAmount}
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
                <Button
                    className="flex justify-center items-center bg-[#243056] w-full h-[55px] text-[20px] rounded-[12px] text-[#5981F3] font-bold transition-all duration-300 mb-7 mt-2"
                    disabled={!tokenOneAmount || !connected}
                >Swap</Button>
            </div>
        </>
    )
}

export default Swap