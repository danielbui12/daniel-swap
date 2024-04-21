import {
    Account as TokenAccount,
    getMint,
} from '@solana/spl-token'
import { Connection, PublicKey } from '@solana/web3.js'
import { fromBigIntQuantity } from '../../daniel_swap_program_sdk'
import { calculateBalances } from './daniel_swap'

function lineBreak() {
    console.log('----------------------------------------------------')
}

export function logNewMint(
    name: string,
    decimals: number,
    quantity: number,
    mint: PublicKey,
) {
    lineBreak()
    console.log(`   Mint: ${name}`)
    console.log(`       Address:    ${mint.toBase58()}`)
    console.log(`       Decimals:   ${decimals}`)
    console.log(`       Quantity:   ${quantity}`)
    lineBreak()
}

// Logs information about a swap - can be pre- or post-swap

export async function logPreSwap(
    connection: Connection,
    owner: PublicKey,
    pool: PublicKey,
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
    amount: number
) {
    const [
        receiveUserBalance,
        receivePoolBalance,
        payUserBalance,
        payPoolBalance,
    ] = await calculateBalances(
        connection,
        owner,
        pool,
        receive.address,
        receive.decimals,
        pay.address,
        pay.decimals
    )
    lineBreak()
    console.log('   PRE-SWAP:')
    console.log()
    console.log(
        `       PAY: ${pay.name.padEnd(
            18,
            ' '
        )}  RECEIVE: ${receive.name.padEnd(18, ' ')}`
    )
    console.log(`       OFFERING TO PAY: ${amount}`)
    console.log()
    console.log('   |====================|==============|==============|')
    console.log('   | Asset:             | User:        | Pool:        |')
    console.log('   |====================|==============|==============|')
    console.log(
        `   | ${pay.name.padEnd(18, ' ')} | ${payUserBalance.padStart(
            12,
            ' '
        )} | ${payPoolBalance.padStart(12, ' ')} |`
    )
    console.log(
        `   | ${receive.name.padEnd(18, ' ')} | ${receiveUserBalance.padStart(
            12,
            ' '
        )} | ${receivePoolBalance.padStart(12, ' ')} |`
    )
    console.log('   |====================|==============|==============|')
    return [payUserBalance, receivePoolBalance];
}

export async function logPostSwap(
    connection: Connection,
    owner: PublicKey,
    pool: PublicKey,
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
    }
) {
    const [
        receiveUserBalance,
        receivePoolBalance,
        payUserBalance,
        payPoolBalance,
    ] = await calculateBalances(
        connection,
        owner,
        pool,
        receive.address,
        receive.decimals,
        pay.address,
        pay.decimals
    )
    console.log('   POST-SWAP:')
    console.log()
    console.log('   |====================|==============|==============|')
    console.log('   | Asset:             | User:        | Pool:        |')
    console.log('   |====================|==============|==============|')
    console.log(
        `   | ${pay.name.padEnd(18, ' ')} | ${payUserBalance.padStart(
            12,
            ' '
        )} | ${payPoolBalance.padStart(12, ' ')} |`
    )
    console.log(
        `   | ${receive.name.padEnd(18, ' ')} | ${receiveUserBalance.padStart(
            12,
            ' '
        )} | ${receivePoolBalance.padStart(12, ' ')} |`
    )
    console.log('   |====================|==============|==============|')
    console.log()
    lineBreak()
    return [payUserBalance, receivePoolBalance];
}

export async function logPool(
    connection: Connection,
    poolAddress: PublicKey,
    tokenAccounts: TokenAccount[],
    assets: {
        name: string
        quantity: number
        decimals: number
        address: PublicKey
    }[],
    k: bigint
) {
    function getHoldings(
        mint: PublicKey,
        tokenAccounts: TokenAccount[]
    ): bigint {
        const holding = tokenAccounts.find((account) =>
            account.mint.equals(mint)
        )
        return holding?.amount || 0n;
    }
    const padding = assets.reduce((max, a) => Math.max(max, a.name.length), 0)
    lineBreak()
    console.log('   Liquidity Pool:')
    console.log(`       Address:    ${poolAddress.toBase58()}`)
    console.log('       Holdings:')
    for (const a of assets) {
        const holding = getHoldings(a.address, tokenAccounts)
        const mint = await getMint(connection, a.address)
        const normalizedHolding = fromBigIntQuantity(holding, mint.decimals)
        console.log(
            `                   ${a.name.padEnd(
                padding,
                ' '
            )} : ${normalizedHolding.padStart(
                12,
                ' '
            )} : ${a.address.toBase58()}`
        )
    }
    logK(k)
    lineBreak()
}

export function logK(k: bigint) {
    console.log(`   ** Constant-Product (K): ${k.toString()}`)
}

export function logChangeInK(changeInK: string) {
    console.log(`   ** Δ Change in Constant-Product (K): ${changeInK}`)
}
