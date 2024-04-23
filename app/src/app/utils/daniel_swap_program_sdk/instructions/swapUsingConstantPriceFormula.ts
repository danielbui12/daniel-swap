import { Connection, PublicKey } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token'
import { createDanielSwapProgram } from '../program'
import { BN } from '@coral-xyz/anchor'

export async function swapUsingConstantPriceFormula(
    connection: Connection,
    payer: PublicKey,
    pool: PublicKey,
    receiveMint: PublicKey,
    payMint: PublicKey,
    quantity: string,
) {
    const program = createDanielSwapProgram(connection);
    return program.methods
        .swapUsingConstantPriceFormula(new BN(quantity))
        .accounts({
            pool,
            receiveMint,
            poolReceiveTokenAccount: getAssociatedTokenAddressSync(
                receiveMint,
                pool,
                true
            ),
            payerReceiveTokenAccount: getAssociatedTokenAddressSync(
                receiveMint,
                payer
            ),
            payMint,
            poolPayTokenAccount: getAssociatedTokenAddressSync(
                payMint,
                pool,
                true
            ),
            payerPayTokenAccount: getAssociatedTokenAddressSync(
                payMint,
                payer
            ),
            payer: payer,
            tokenProgram: TOKEN_PROGRAM_ID,
        })
        .instruction()
}
