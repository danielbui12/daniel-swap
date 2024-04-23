import { Connection } from '@solana/web3.js';
import { Transaction, SystemProgram } from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, NATIVE_MINT, TOKEN_PROGRAM_ID, createSyncNativeInstruction, getAccount, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { confirmTransactionFromFrontend, verifyTransaction } from './transactionSigner';

export const createWrappedSolana = async (connection: Connection, owner: PublicKey, amount: number): Promise<Transaction> => {
    const associatedToken = getAssociatedTokenAddressSync(
        NATIVE_MINT,
        owner,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
    );
    const ltsBlock = await connection.getLatestBlockhash();

    return new Transaction({
        ...ltsBlock,
        feePayer: owner,
    }).add(
        SystemProgram.transfer({
            fromPubkey: owner,
            toPubkey: associatedToken,
            lamports: amount,
        }),
        createSyncNativeInstruction(associatedToken, TOKEN_PROGRAM_ID)
    );
}

export const createWrappedSolanaIfNeeded = async (
    connection: Connection,
    owner: PublicKey,
    expectToWrapAmount: BigNumber,
    wallet: {
        wallet: any,
        signTransaction: any
    }
) => {
    const nativeAmount = await connection.getBalance(owner);
    const ata = getAssociatedTokenAddressSync(NATIVE_MINT, owner);
    const tokenAccount = await getAccount(connection, ata).catch(() => ({ amount: 0 }))
    const isNotEnoughSOL = expectToWrapAmount.isGreaterThan(new BigNumber(nativeAmount));
    const isNotEnoughToken = expectToWrapAmount.isGreaterThan(new BigNumber(tokenAccount.amount.toString()));

    if (isNotEnoughToken && isNotEnoughSOL) {
        return {
            message: "Not enough SOL or wSOL",
            description: "Please deposit more SOL or wSOL"
        }
    }
    if (isNotEnoughToken && !isNotEnoughSOL) {
        const tx = await createWrappedSolana(
            connection,
            owner,
            expectToWrapAmount.toNumber(),
        )
        const txSignature = await confirmTransactionFromFrontend(connection, tx, wallet);
        const isFailed = await verifyTransaction(connection, txSignature)
        if (isFailed) {
            return {
                message: "Failed to wrap Solana",
            }
        }
    }

    return false;
}