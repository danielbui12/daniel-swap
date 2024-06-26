import { Connection, Keypair, PublicKey, SystemProgram } from '@solana/web3.js'
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token'
import { toBigIntQuantity } from '../utils/format'
import { createDanielSwapProgram } from '../program'
import { BN } from 'bn.js'

export async function fundPool(
    connection: Connection,
    payer: Keypair,
    pool: PublicKey,
    mint: PublicKey,
    quantity: number,
    decimals: number
) {
    const program = createDanielSwapProgram(connection);
    return program.methods
        .fundPool(
            new BN(toBigIntQuantity(quantity, decimals).toString())
        )
        .accounts({
            pool,
            mint,
            poolTokenAccount: getAssociatedTokenAddressSync(mint, pool, true),
            payerTokenAccount: getAssociatedTokenAddressSync(
                mint,
                payer.publicKey
            ),
            payer: payer.publicKey,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        })
        .instruction()
}
