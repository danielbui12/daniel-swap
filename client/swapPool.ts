import { expect } from 'chai';
import { createWrappedNativeAccount } from "@solana/spl-token";
import { createPool, fundPool } from "../daniel_swap_program_sdk";
import { ASSETS, W_SOLANA_MINT } from "../tests/util/const";
import { boilerPlateReduction } from "../tests/util/utils";
import { connection, payer, poolAddress } from "./utils";

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
        address: W_SOLANA_MINT
    });

    await expectIxToSucceed(createPool(connection, payer, poolAddress), payer);
    for (const asset of assets) {
        if (asset.address.equals(W_SOLANA_MINT)) {
            await expect(createWrappedNativeAccount(
                connection,
                payer,
                payer.publicKey,
                asset.quantity * 10 ** asset.decimals,
            )).to.be.fulfilled;
        }
        await expectIxToSucceed(fundPool(
            connection,
            payer,
            poolAddress,
            asset.address,
            asset.quantity,
            asset.decimals
        ), payer);
    }
}

main()
    .then(() => 
        process.exit(0)
    ).catch((err) => {
        console.log(err); process.exit(1) 
    });