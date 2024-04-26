import { PublicKey, Connection, TransactionInstruction } from '@solana/web3.js';
import { getOrCreateAta } from './getOrCreateAta';
import { ConfirmTxWalletWithPublicKey, confirmTransactionInstruction, verifyTransaction } from './transactionSigner';
export const asyncInitAccount = async (
    mints: PublicKey[],
    connection: Connection,
    owner: PublicKey,
    wallet: ConfirmTxWalletWithPublicKey
) => {
    const ixs: TransactionInstruction[] = [];
    await Promise.all(
        mints.map(async (mint) => {
            const {
                ix,
                isError
            } = await getOrCreateAta(connection, owner, mint, owner);
            if (isError) {
                throw new Error('Failed to create associated token account')
            }
            if (ix) {
                ixs.push(ix);
            }
        })
    )
    if (ixs.length === 0) return;
    const txSig = await confirmTransactionInstruction(connection, ixs, wallet);
    return verifyTransaction(connection, txSig);
}