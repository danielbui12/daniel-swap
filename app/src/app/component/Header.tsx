"use client";

import React from "react";
import Logo from "@/app/assets/images/logo.jpeg";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Button, notification } from "antd";
import { getAssociatedTokenAddressSync, mintTo } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { MOVE_AUTHORITY, MOVE_PROGRAM_ID } from "../constants";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from '@solana/web3.js';
import Link from "next/link";

const ReactUIWalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
);

function Header() {
    const { connection } = useConnection()
    const { publicKey, connected } = useWallet()
    const { setVisible, visible } = useWalletModal()
    const onRequestMOVE = async () => {
        if (!connected && !visible) {
            setVisible(true);
            return;
        }
        
        const destination = getAssociatedTokenAddressSync(MOVE_PROGRAM_ID, publicKey as PublicKey);        
        await mintTo(
            connection,
            MOVE_AUTHORITY,
            MOVE_PROGRAM_ID,
            destination,
            MOVE_AUTHORITY.publicKey,
            100n * 10n ** 9n,
        )
        .then((txSig) => notification.success({
            message: `Minted 100 MOVE for ${publicKey?.toString()}`,
            description: <a href={`https://solscan.io/tx/${txSig}?cluster=devnet`} target="_blank">View the transaction</a>
        }))
        .catch((err) => console.log(err));
        
    }
    return (
        <header className="w-full mb-5">
            <div 
                className="flex justify-between items-center w-full border-b-4 border-indigo-500"
                style={{ paddingBottom: '16px', justifyContent: 'space-between' }}
            >
                <div>
                    <Image 
                        width={50}
                        height={50}
                        loading="lazy"
                        src={Logo}
                        alt="logo"
                        className=""
                    />
                </div>
                <div className="flex gap-5 items-center">
                    <Button onClick={onRequestMOVE}>
                        Request MOVE
                    </Button>
                    <Link href="/">
                        Swap
                    </Link>
                    <Link href="/liquidity">
                        Fund Liquidity
                    </Link>
                </div>
                <div>
                    <ReactUIWalletMultiButtonDynamic />
                </div>
            </div>
        </header>
    );
}

export default Header;