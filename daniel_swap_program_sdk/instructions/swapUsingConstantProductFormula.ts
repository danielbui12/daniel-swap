import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token'
import { toBigIntQuantity } from '../utils/format'
import { createDanielSwapProgram } from '../program'
import { BN } from 'bn.js';

export async function swapUsingConstantProductFormula(
    connection: Connection,
    payer: Keypair,
    pool: PublicKey,
    receiveMint: PublicKey,
    payMint: PublicKey,
    quantity: number,
    decimals: number
) {
    const program = createDanielSwapProgram(connection);
    return program.methods
        .swapUsingConstantProductFormula(new BN(toBigIntQuantity(quantity, decimals).toString()))
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
                payer.publicKey
            ),
            payMint,
            poolPayTokenAccount: getAssociatedTokenAddressSync(
                payMint,
                pool,
                true
            ),
            payerPayTokenAccount: getAssociatedTokenAddressSync(
                payMint,
                payer.publicKey
            ),
            payer: payer.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
        })
        .instruction()
}
