import { Program, Provider } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";

import IDL from "./daniel_swap_program.json";
import { DanielSwapProgram } from "./daniel_swap_program";

export const DANIEL_SWAP_PROGRAM_ID = new PublicKey("4X1idCYPtEcmv7F6nn9Te1xzjTtPNm5JiR4f9ZUuGAvd");

export function createDanielSwapProgram(
    connection: Connection,
    programId: PublicKey = DANIEL_SWAP_PROGRAM_ID,
    payer?: PublicKey,
): Program<DanielSwapProgram> {
    const provider: Provider = {
        connection,
        publicKey: payer == undefined ? undefined : new PublicKey(payer),
    };
    return new Program<DanielSwapProgram>(
        IDL as any,
        new PublicKey(programId),
        provider,
    );
}
