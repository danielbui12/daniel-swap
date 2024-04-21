import {
    Account as TokenAccount,
    getAccount as getTokenAccount,
    getAssociatedTokenAddressSync,
    getMultipleAccounts as getMultipleTokenAccounts,
} from '@solana/spl-token'
import { Connection, PublicKey } from '@solana/web3.js'
import { fromBigIntQuantity } from '../../daniel_swap_program_sdk/utils/format'

export async function calculateBalances(
    connection: Connection,
    owner: PublicKey,
    pool: PublicKey,
    receiveAddress: PublicKey,
    receiveDecimals: number,
    payAddress: PublicKey,
    payDecimals: number
): Promise<[string, string, string, string]> {
    const receiveUserTokenAccount = await getTokenAccount(
        connection,
        getAssociatedTokenAddressSync(receiveAddress, owner)
    )
    const receiveUserBalance = fromBigIntQuantity(
        receiveUserTokenAccount.amount,
        receiveDecimals
    )
    const payUserTokenAccount = await getTokenAccount(
        connection,
        getAssociatedTokenAddressSync(payAddress, owner)
    )
    const payUserBalance = fromBigIntQuantity(
        payUserTokenAccount.amount,
        payDecimals
    )
    const receivePoolTokenAccount = await getTokenAccount(
        connection,
        getAssociatedTokenAddressSync(receiveAddress, pool, true)
    )
    const receivePoolBalance = fromBigIntQuantity(
        receivePoolTokenAccount.amount,
        receiveDecimals
    )
    const payPoolTokenAccount = await getTokenAccount(
        connection,
        getAssociatedTokenAddressSync(payAddress, pool, true)
    )
    const payPoolBalance = fromBigIntQuantity(
        payPoolTokenAccount.amount,
        payDecimals
    )
    return [
        receiveUserBalance,
        receivePoolBalance,
        payUserBalance,
        payPoolBalance,
    ]
}

export function calculateK(tokenAccounts: TokenAccount[]): bigint {
    return tokenAccounts
        .map((a) => a.amount)
        .reduce((product, i) => product * i)
}

export function calculateChangeInK(start: bigint, end: bigint): string {
    const startNum = Number(start)
    const endNum = Number(end)
    if (startNum === 0) {
        throw new Error('Cannot calculate percent change for a zero value.')
    }
    const change = endNum - startNum
    const percentChange = (change / startNum) * 100
    return percentChange.toFixed(4) + '%'
}
