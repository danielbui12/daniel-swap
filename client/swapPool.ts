import { expect } from 'chai';
import { createWrappedNativeAccount, NATIVE_MINT } from "@solana/spl-token";
import { createPool, fundPool } from "../daniel_swap_program_sdk";
import { ASSETS } from "../tests/util/const";
import { boilerPlateReduction } from "../tests/util/utils";
import { connection, payer, poolAddress } from "./utils";
import { claimPool } from '../daniel_swap_program_sdk/instructions/claimPool';
import { PublicKey } from '@metaplex-foundation/js';

async function main() {
    const {
        expectIxToSucceed,
    } = boilerPlateReduction(connection, payer);

    const assets = ASSETS.map((o) => {
        return {
            name: o[0],
            quantity: o[5],
            decimals: o[4],
            address: o[6].publicKey,
        }
    })
    assets.push({
        name: 'wSOL',
        quantity: 10,
        decimals: 9,
        address: NATIVE_MINT
    });

    await expectIxToSucceed(claimPool(
        connection,
        payer.publicKey,
        poolAddress,
        new PublicKey('ASdZagtrNjFoFTfd1kDKeFxFgbPenuFbepd1EVYXsyt4'),
        900,
        assets[0].decimals
    ), payer);

    // await expectIxToSucceed(createPool(connection, payer, poolAddress), payer);
    // for (const asset of assets) {
    //     if (asset.address.equals(NATIVE_MINT)) {
    //         await expect(createWrappedNativeAccount(
    //             connection,
    //             payer,
    //             payer.publicKey,
    //             asset.quantity * 10 ** asset.decimals,
    //         )).to.be.fulfilled;
    //     }
    //     await expectIxToSucceed(fundPool(
    //         connection,
    //         payer,
    //         poolAddress,
    //         asset.address,
    //         asset.quantity,
    //         asset.decimals
    //     ), payer);
    // }
}

main()
    .then(() => 
        process.exit(0)
    ).catch((err) => {
        console.log(err); process.exit(1) 
    });