import * as anchor from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { createPool, fundPool, swapUsingConstantProductFormula, swapUsingConstantPriceFormula } from '../daniel_swap_program_sdk'
import {
    calculateChangeInK,
    calculateK,
} from './util/daniel_swap'
import {
    logChangeInK,
    logPool,
    logPostSwap,
    logPreSwap,
} from './util/log'
import { CREATOR_KEYPAIR, SWAPPER_KEYPAIR, ASSETS } from './util/const'
import { deriveLiquidityPoolPDA, fetchPool } from '../daniel_swap_program_sdk/accounts/liquidityPool'
import { expect } from 'chai'
import { boilerPlateReduction, getRandomInt, sleepSeconds } from './util/utils'
import { createWrappedNativeAccount, getAccount, getAssociatedTokenAddressSync, mintTo, NATIVE_MINT } from '@solana/spl-token'

/**
 * Our main unit tests module
 */
describe('Daniel Swap Program', async () => {
    // Configurations
    const provider = anchor.AnchorProvider.env()
    anchor.setProvider(provider)
    const payer = (provider.wallet as anchor.Wallet).payer
    const poolAddress = deriveLiquidityPoolPDA();

    const creator = CREATOR_KEYPAIR;
    const swapper = SWAPPER_KEYPAIR;

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
        quantity: 100,
        decimals: 9,
        address: NATIVE_MINT
    });

    const {
        expectIxToSucceed,
        expectIxToFailWithError,
    } = boilerPlateReduction(provider.connection, creator);

    // Used as a flag to only initialize the Liquidity Pool once
    let programInitialized = false

    /**
     * Check if the Liquidity Pool exists and set the flag
     */
    before('Check if Pool exists', async () => {
        let poolAccountInfo = await provider.connection.getAccountInfo(
            poolAddress
        )
        if (poolAccountInfo != undefined && poolAccountInfo.lamports != 0) {
            console.log('Pool already initialized!')
            console.log(`Address: ${poolAddress.toBase58()}`)
            expect(poolAddress.toString()).to.be.not.empty;
            programInitialized = true
        }
    })

    /**
     * Initialize the Liquidity Pool if it doesn't exist already
     */
    it('Create Pool', async () => {        
        if (!programInitialized) {
            await expectIxToSucceed(createPool(provider.connection, creator, poolAddress), creator);
        }
    })

    /**
     * Pair SOL/<asset>
     */
    for (const asset of assets) {
        const mint = new PublicKey(asset.address)
        it(`Fund Pool with: ${asset.name}`, async () => {
            const destination = getAssociatedTokenAddressSync(
                mint,
                creator.publicKey,
            );
            console.log(`${asset.name} ata`, destination.toString(), 'of', creator.publicKey.toString());
            const mintAmount = asset.quantity * 10 ** asset.decimals;
            await expect(
                mint.equals(NATIVE_MINT) ? 
                    createWrappedNativeAccount(
                        provider.connection,
                        creator,
                        creator.publicKey,
                        mintAmount,
                    ) :
                    mintTo(
                        provider.connection,
                        payer,
                        mint,
                        destination,
                        payer,
                        mintAmount
                    )
            ).to.be.fulfilled;

            const { amount: balanceBefore } = await getAccount(provider.connection, destination);
            expect(balanceBefore.toString()).eq(mintAmount.toString());

            await expectIxToSucceed(fundPool(
                provider.connection,
                creator,
                poolAddress,
                asset.address,
                asset.quantity,
                asset.decimals
            ), creator);


            const { amount: balanceAfter } = await getAccount(provider.connection, destination);
            expect(balanceAfter).equals(0n);
        })
    }

    async function getPoolData(log: boolean): Promise<bigint> {
        const pool = await fetchPool(
            provider.connection,
            poolAddress,
        );
        const poolTokenAccounts = await Promise.all(pool.assets.map((p) => {
            const ata = getAssociatedTokenAddressSync(p, poolAddress, true);
            return getAccount(provider.connection, ata);
        }));
            
        const k = calculateK(poolTokenAccounts)
        if (log) {
            await logPool(
                provider.connection,
                poolAddress,
                poolTokenAccounts,
                assets,
                k
            )
        }
        return k
    }

    it('Get Liquidity Pool Data', async () => await getPoolData(true))

    it('Mint for Swapper', async () => {
        for (const asset of assets) {
            const mintAmount = 100 * 10 ** asset.decimals;
            const mint = asset.address;
            const destination = getAssociatedTokenAddressSync(
                mint,
                swapper.publicKey,
            );

            await expect(
                asset.address.equals(NATIVE_MINT) ?
                    createWrappedNativeAccount(
                        provider.connection,
                        swapper,
                        swapper.publicKey,
                        mintAmount,
                    ) :
                    mintTo(
                        provider.connection,
                        swapper,
                        mint,
                        destination,
                        payer,
                        mintAmount,
                    )
            ).to.be.fulfilled;
        }
    })

    it('Fail Swap Using "Constant Price" Due to "Zero amount"', async () => {
        const receiveAssetIndex = 0; // Assuming this is an asset index that exists
        const payAssetIndex = 1; // Assuming this is another asset index that exists
        const payAmount = 0;

        await expectIxToFailWithError(
            swapUsingConstantPriceFormula(
                provider.connection,
                swapper,
                poolAddress,
                assets[receiveAssetIndex].address,
                assets[payAssetIndex].address,
                payAmount,
                assets[payAssetIndex].decimals
            ),
            "Zero amount",
            swapper,
        );
    });

    it('Fail Swap Using "Constant Product" Due to "Zero amount"', async () => {
        const receiveAssetIndex = 0; // Assuming this is an asset index that exists
        const payAssetIndex = 1; // Assuming this is another asset index that exists
        const payAmount = 0;

        await expectIxToFailWithError(
            swapUsingConstantProductFormula(
                provider.connection,
                swapper,
                poolAddress,
                assets[receiveAssetIndex].address,
                assets[payAssetIndex].address,
                payAmount,
                assets[payAssetIndex].decimals
            ),
            "Zero amount",
            swapper,
        );
    });

    it('Fail Swap Using "Constant Price" Due to "Over Invalid amount allocatable"', async () => {
        const receiveAssetIndex = 0; // Assuming this is an asset index that exists
        const payAssetIndex = 1; // Assuming this is another asset index that exists
        // Set a very high pay amount, assuming the pool cannot support this swap
        const payAmount = 500; // An exaggeratedly high amount for demonstration

        await expectIxToFailWithError(
            swapUsingConstantPriceFormula(
                provider.connection,
                swapper,
                poolAddress,
                assets[receiveAssetIndex].address,
                assets[payAssetIndex].address,
                payAmount,
                assets[payAssetIndex].decimals
            ),
            "Invalid amount allocatable",
            swapper,
        );
    });

    it('Fail Swap Using "Constant Product" Due to "Invalid amount allocatable"', async () => {
        const receiveAssetIndex = 0; // Assuming this is an asset index that exists
        const payAssetIndex = 1; // Assuming this is another asset index that exists
        // Set a very high pay amount, assuming the pool cannot support this swap
        const payAmount = 200; // An exaggeratedly high amount for demonstration

        await expectIxToFailWithError(
            swapUsingConstantProductFormula(
                provider.connection,
                swapper,
                poolAddress,
                assets[receiveAssetIndex].address,
                assets[payAssetIndex].address,
                payAmount,
                assets[payAssetIndex].decimals
            ),
            "insufficient funds",
            swapper,
        );
    });

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
        const initialK = await getPoolData(false)
        await logPreSwap(
            provider.connection,
            swapper.publicKey,
            poolAddress,
            receive,
            pay,
            payAmount
        )
        await expectIxToSucceed(
            swapUsingConstantProductFormula(
                provider.connection,
                swapper,
                poolAddress,
                receive.address,
                pay.address,
                payAmount,
                pay.decimals
            ),
            swapper
        )
        await sleepSeconds(2)
        await logPostSwap(
            provider.connection,
            swapper.publicKey,
            poolAddress,
            receive,
            pay
        )
        const resultingK = await getPoolData(false)
        logChangeInK(calculateChangeInK(initialK, resultingK))
    }

    async function trySwapWithConstantPriceFormula(
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
        payAmount: number,
    ) {
        await sleepSeconds(2);

        await logPreSwap(
            provider.connection,
            swapper.publicKey,
            poolAddress,
            receive,
            pay,
            payAmount
        )
        await expectIxToSucceed(
            swapUsingConstantPriceFormula(
                provider.connection,
                swapper,
                poolAddress,
                receive.address,
                pay.address,
                payAmount,
                pay.decimals
            ),
            swapper
        )
        await sleepSeconds(2)
        await logPostSwap(
            provider.connection,
            swapper.publicKey,
            poolAddress,
            receive,
            pay
        )
    }

    it('Try Swap Constant Price wSOL/MOVE', async () => {
        const receiveAssetIndex = 0
        console.log('try swap to', assets[receiveAssetIndex].name);

        const payAssetIndex = 1
        console.log('try swap from MOVE/wSOL', assets[payAssetIndex].name);
        // Pay amount can't be zero
        const payAmount = getRandomInt(1, 10);
        console.log('try swap amount:', payAmount);
        await trySwapWithConstantPriceFormula(
            assets[receiveAssetIndex],
            assets[payAssetIndex],
            payAmount
        )
    })

    it('Try Swap Constant Price MOVE/wSOL', async () => {
        const receiveAssetIndex = 1
        console.log('try swap to', assets[receiveAssetIndex].name);

        const payAssetIndex = 0
        console.log('try swap from', assets[payAssetIndex].name);
        // Pay amount can't be zero
        const payAmount = getRandomInt(1, 20);
        console.log('try swap amount:', payAmount);
        await trySwapWithConstantPriceFormula(
            assets[receiveAssetIndex],
            assets[payAssetIndex],
            payAmount
        )
    })

    it('Try Swap Constant Product wSOL/MOVE', async () => {
        const receiveAssetIndex = 0;
        console.log('try swap to', assets[receiveAssetIndex].name);

        const payAssetIndex = 1;
        console.log('try swap from', assets[payAssetIndex].name);
        // Pay amount can't be zero
        const payAmount = getRandomInt(1, 10);
        console.log('try swap amount:', payAmount);
        await trySwapWithConstantProductFormula(
            assets[receiveAssetIndex],
            assets[payAssetIndex],
            payAmount
        )
    })

    it('Try Swap Constant Product MOVE/wSOL', async () => {
        const receiveAssetIndex = 1;
        console.log('try swap to', assets[receiveAssetIndex].name);

        const payAssetIndex = 0;
        console.log('try swap from', assets[payAssetIndex].name);
        // Pay amount can't be zero
        const payAmount = getRandomInt(1, 20);
        console.log('try swap amount:', payAmount);
        await trySwapWithConstantProductFormula(
            assets[receiveAssetIndex],
            assets[payAssetIndex],
            payAmount
        )
    })
})