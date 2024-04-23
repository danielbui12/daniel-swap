import { Connection, PublicKey, SystemProgram } from '@solana/web3.js'
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token'
import { createDanielSwapProgram } from '../program'
import { BN } from '@coral-xyz/anchor'

export async function fundPool(
    connection: Connection,
    payer: PublicKey,
    pool: PublicKey,
    mint: PublicKey,
    quantity: string
) {
    const program = createDanielSwapProgram(connection);
    return program.methods
        .fundPool(
            new BN(quantity)
        )
        .accounts({
            pool,
            mint,
            poolTokenAccount: getAssociatedTokenAddressSync(mint, pool, true),
            payerTokenAccount: getAssociatedTokenAddressSync(
                mint,
                payer
            ),
            payer: payer,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        })
        .instruction()
}
