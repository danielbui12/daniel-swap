import { Transaction, Connection } from "@solana/web3.js";

export async function confirmTransactionFromFrontend(connection: Connection, transaction: string | Transaction, wallet: any) {
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