import { Connection, Keypair, PublicKey, SystemProgram } from '@solana/web3.js'
import { createDanielSwapProgram } from '../program'

export async function createPool(
    connection: Connection,
    payer: Keypair,
    poolAddress: PublicKey
) {
    const program = createDanielSwapProgram(connection);
    return program.methods
        .createPool()
        .accounts({
            pool: poolAddress,
            payer: payer.publicKey,
            systemProgram: SystemProgram.programId,
        })
        .instruction()
}