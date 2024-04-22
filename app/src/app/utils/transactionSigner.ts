import { Transaction, Connection } from "@solana/web3.js";

export async function confirmTransactionFromFrontend(connection: Connection, encodedTransaction: string, wallet: any) {
    const recoveredTransaction = Transaction.from(
        Buffer.from(encodedTransaction, 'base64')
    );
    const signedTx = await wallet.signTransaction(recoveredTransaction);
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