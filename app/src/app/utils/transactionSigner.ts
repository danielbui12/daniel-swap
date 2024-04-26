import { Transaction, Connection, TransactionInstruction, PublicKey } from "@solana/web3.js";

export interface ConfirmTxWallet {
    wallet: any,
    signTransaction: any,
}
export async function confirmTransactionFromFrontend(
    connection: Connection,
    transaction: string | Transaction,
    wallet: ConfirmTxWallet,
) {
    let _transaction = transaction;
    if (typeof transaction === "string") {
        _transaction = Transaction.from(
            Buffer.from(transaction, 'base64')
        );
    }
    const signedTx = await wallet.signTransaction(_transaction);
    const confirmTransaction = await connection.sendRawTransaction(
        signedTx.serialize({ requireAllSignatures: false })
    );
    return confirmTransaction;
}

export interface ConfirmTxWalletWithPublicKey extends ConfirmTxWallet {
    publicKey: PublicKey;
} 
export async function confirmTransactionInstruction(
    connection: Connection,
    transactionIx: TransactionInstruction | TransactionInstruction[],
    wallet: ConfirmTxWalletWithPublicKey
) {
    const ltsBlock = await connection.getLatestBlockhash();
    const transaction = new Transaction({
        ...ltsBlock,
        feePayer: wallet.publicKey,
    })
    if (Array.isArray(transactionIx)) {
        transaction.add(...transactionIx)
    } else {
        transaction.add(transactionIx)
    }
    const signedTx = await wallet.signTransaction(transaction);
    const confirmTransaction = await connection.sendRawTransaction(
        signedTx.serialize({ requireAllSignatures: false })
    );
    return confirmTransaction;
}

export async function signTransactionFromFrontend(encodedTransaction: string , signer: any) {
    const recoveredTransaction = Transaction.from(
        Buffer.from(encodedTransaction, 'base64')
    );
    recoveredTransaction.partialSign(...signer);
    const serializedTransaction = recoveredTransaction.serialize({ requireAllSignatures: false });
    const transactionBase64 = serializedTransaction.toString('base64');
    return transactionBase64;
}

export const verifyTransaction = async (connection: Connection, tx: string) => {
    const block = await connection.getLatestBlockhash();
    const result = await connection.confirmTransaction({
        ...block,
        signature: tx,
    }, 'finalized');
    return !!result.value.err
};