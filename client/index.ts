import * as anchor from '@coral-xyz/anchor'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import assetsConfig from '../tests/util/assets.json'
import { createPool, fundPool, swapUsingConstantProductFormula, swapUsingConstantPriceFormula } from '../daniel_swap_program_sdk'
import {
    calculateChangeInK,
    calculateK,
} from '../tests/util/daniel_swap'
import {
    logChangeInK,
    logPool,
    logPostSwap,
    logPreSwap,
} from '../tests/util/log'
import { mintExistingTokens } from '../tests/util/token'
import { CREATOR_KEYPAIR, DANIEL_SWAP_PROGRAM_KEYPAIR, SWAPPER_KEYPAIR } from '../tests/util/const'
import { deriveLiquidityPoolPDA, fetchPoolTokenAccounts } from '../daniel_swap_program_sdk/accounts/liquidityPool'
import { expect } from 'chai'
import { boilerPlateReduction, sleepSeconds } from '../tests/util/utils'
import { getAccount, getAssociatedTokenAddressSync, getOrCreateAssociatedTokenAccount } from '@solana/spl-token'

const connection = new Connection('https://api.devnet.solana.com')
const payer = CREATOR_KEYPAIR

const poolAddress = deriveLiquidityPoolPDA();
const assets = assetsConfig.map((o) => {
    return {
        name: o.name,
        quantity: o.quantity,
        decimals: o.decimals,
        address: new PublicKey(o.keypair.publicKey),
    }
})
const maxAssetIndex = assetsConfig.length - 1

const creator = CREATOR_KEYPAIR;
const swapper = SWAPPER_KEYPAIR;
const danielSwapProgram = DANIEL_SWAP_PROGRAM_KEYPAIR

const {
    expectIxToSucceed,
    expectIxToFailWithError,
} = boilerPlateReduction(connection, creator);

const getTokenBalance = async (tokenAccount: PublicKey) =>
    (await getAccount(connection, tokenAccount)).amount;

/**
 * Initialize the Liquidity Pool if it doesn't exist already
 */
const step1 = async () => {
    await expectIxToSucceed(createPool(connection, creator, poolAddress), creator);
}

const step2 = async () => {
    for (const asset of assets) {
            const ata = getAssociatedTokenAddressSync(
                asset.address,
                creator.publicKey,
            )

            const poolAta = await getOrCreateAssociatedTokenAccount(
                connection,
                payer,
                asset.address,
                poolAddress,
                true
            )
            await sleepSeconds(2);
            console.log('poolAta', poolAta.toString())
            console.log('ata', ata.toString())
            const balanceBefore = await getTokenBalance(ata)
            await mintExistingTokens(
                connection,
                payer,
                creator,
                asset.address,
                asset.quantity,
                asset.decimals
            )
            const balanceAfterMinting = await getTokenBalance(ata)
            await expectIxToSucceed(fundPool(
                connection,
                creator,
                poolAddress,
                asset.address,
                asset.quantity,
                asset.decimals
            ), creator)
            const balanceAfterFunding = await getTokenBalance(ata)
    }
}

async function getPoolData(log: boolean): Promise<bigint> {
    const poolTokenAccounts = await fetchPoolTokenAccounts(
        poolAddress,
        connection,
    )
    const k = calculateK(poolTokenAccounts)
    if (log) {
        await logPool(
            connection,
            poolAddress,
            poolTokenAccounts,
            assets,
            k
        )
    }
    return k
}

// it('Get Liquidity Pool Data', async () => await getPoolData(true))

async function trySwapWithConstantProductFormula(
    receive: {
        name: string
        quantity: number
        decimals: number
        address: PublicKey
    },
    pay: {
        name: string
        quantity: number
        decimals: number
        address: PublicKey
    },
    payAmount: number
) {
    await mintExistingTokens(
        connection,
        payer,
        creator,
        pay.address,
        payAmount,
        pay.decimals
    )
    await sleepSeconds(2);
    const initialK = await getPoolData(false)
    await logPreSwap(
        connection,
        payer.publicKey,
        poolAddress,
        receive,
        pay,
        payAmount
    )
    await swapUsingConstantProductFormula(
        connection,
        payer,
        poolAddress,
        receive.address,
        pay.address,
        payAmount,
        pay.decimals
    )
    await sleepSeconds(2)
    await logPostSwap(
        connection,
        payer.publicKey,
        poolAddress,
        receive,
        pay
    )
    const resultingK = await getPoolData(false)
    logChangeInK(calculateChangeInK(initialK, resultingK))
}

// for (let x = 0; x < 10; x++) {
//     it('Try Swap', async () => {
//         const receiveAssetIndex = getRandomInt(maxAssetIndex)
//         // Pay asset can't be the same as receive asset
//         let payAssetIndex = getRandomInt(maxAssetIndex)
//         while (payAssetIndex === receiveAssetIndex) {
//             payAssetIndex = getRandomInt(maxAssetIndex)
//         }
//         // Pay amount can't be zero
//         let payAmount = getRandomInt(ASSETS[payAssetIndex][5])
//         while (payAmount === 0) {
//             payAmount = getRandomInt(ASSETS[payAssetIndex][5])
//         }
//         await trySwapWithConstantProductFormula(
//             assets[receiveAssetIndex],
//             assets[payAssetIndex],
//             payAmount
//         )
//     })
// }


async function main() {
    // await step1()
    await step2()
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})