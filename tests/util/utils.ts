import {
    ComputeBudgetProgram,
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
    Signer,
    Transaction,
    TransactionInstruction,
    sendAndConfirmTransaction,
} from "@solana/web3.js";
import { use as chaiUse, config, expect } from "chai";
import chaiAsPromised from "chai-as-promised";

chaiUse(chaiAsPromised);

//prevent chai from truncating error messages
config.truncateThreshold = 0;

export const range = (size: number) => [...Array(size).keys()];

export function programIdFromEnvVar(envVar: string): PublicKey {
    if (!process.env[envVar]) {
        throw new Error(`${envVar} environment variable not set`);
    }
    try {
        return new PublicKey(process.env[envVar]!);
    } catch (e) {
        throw new Error(
            `${envVar} environment variable is not a valid program id - value: ${process.env[envVar]}`,
        );
    }
}

class SendIxError extends Error {
    logs: string;

    constructor(originalError: Error & { logs?: string[] }) {
        //The newlines don't actually show up correctly in chai's assertion error, but at least
        // we have all the information and can just replace '\n' with a newline manually to see
        // what's happening without having to change the code.
        const logs = originalError.logs?.join("\n") || "error had no logs";
        super(originalError.message + "\nlogs:\n" + logs);
        this.stack = originalError.stack;
        this.logs = logs;
    }
}

export const boilerPlateReduction = (
    connection: Connection,
    defaultSigner: Signer,
) => {
    // for signing wormhole messages
    const defaultNodeWallet = Keypair.fromSecretKey(defaultSigner.secretKey);

    const payerToWallet = (payer?: Signer) =>
        !payer || payer === defaultSigner
            ? defaultNodeWallet
            : Keypair.fromSecretKey(payer.secretKey);

    const requestAirdrop = async (account: PublicKey) => 
        connection.confirmTransaction(
            await connection.requestAirdrop(account, 1000 * LAMPORTS_PER_SOL),
        );

    const sendAndConfirmIx = async (
        ix:
            | TransactionInstruction
            | Promise<TransactionInstruction>
            | TransactionInstruction[]
            | Promise<TransactionInstruction[]>,
        signerOrSignersOrComputeUnits?: Signer | Signer[] | number,
        computeUnits?: number,
    ) => {
        let [signers, units] = (() => {
            if (!signerOrSignersOrComputeUnits)
                return [[defaultSigner], computeUnits];

            if (typeof signerOrSignersOrComputeUnits === "number") {
                if (computeUnits !== undefined)
                    throw new Error("computeUnits can't be specified twice");
                return [[defaultSigner], signerOrSignersOrComputeUnits];
            }

            return [
                Array.isArray(signerOrSignersOrComputeUnits)
                    ? signerOrSignersOrComputeUnits
                    : [signerOrSignersOrComputeUnits],
                computeUnits,
            ];
        })();

        const tx = new Transaction();
        const unwrapIx = await ix;
        if (Array.isArray(unwrapIx)) {
            tx.add(...unwrapIx);
        } else {
            tx.add(unwrapIx);
        }
        if (units) tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units }));
        try {
            console.log('sending transaction');
            return await sendAndConfirmTransaction(connection, tx, signers);
        } catch (error: any) {
            throw new SendIxError(error);
        }
    };

    const expectIxToSucceed = async (
        ix:
            | TransactionInstruction
            | Promise<TransactionInstruction>
            | TransactionInstruction[]
            | Promise<TransactionInstruction[]>,
        signerOrSignersOrComputeUnits?: Signer | Signer[] | number,
        computeUnits?: number,
    ) =>
        expect(sendAndConfirmIx(ix, signerOrSignersOrComputeUnits, computeUnits)).to
            .be.fulfilled;

    const expectIxToFailWithError = async (
        ix: TransactionInstruction | Promise<TransactionInstruction>,
        errorMessage: string,
        signerOrSignersOrComputeUnits?: Signer | Signer[] | number,
        computeUnits?: number,
    ) => {
        try {
            await sendAndConfirmIx(ix, signerOrSignersOrComputeUnits, computeUnits);
        } catch (error) {
            expect((error as SendIxError).logs).includes(errorMessage);
            return;
        }
        expect.fail("Expected transaction to fail");
    };

    const expectTxToSucceed = async (
        tx: Transaction | Promise<Transaction>,
        payer?: Signer,
    ) => {
        const wallet = payerToWallet(payer);
        return expect(
            sendAndConfirmTransaction(
                connection,
                await tx,
                [wallet],
            ),
        ).to.be.fulfilled;
    };

    return {
        requestAirdrop,
        sendAndConfirmIx,
        expectIxToSucceed,
        expectIxToFailWithError,
        expectTxToSucceed,
    };
};

export const sleepSeconds = async (s: number) =>
    await new Promise((f) => setTimeout(f, s * 1000))

export function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * TODO: calculate price impact
 * let 1 SOL = 10 MOVE
 */