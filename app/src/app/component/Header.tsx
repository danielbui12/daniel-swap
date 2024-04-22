"use client";

import React from "react";
import Logo from "@/app/assets/images/logo.jpeg";
import Image from "next/image";
import dynamic from "next/dynamic";

const ReactUIWalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
);

function Header() {
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
                <div>
                    <ReactUIWalletMultiButtonDynamic />
                </div>
            </div>
        </header>
    );
}

export default Header;