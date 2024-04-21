import { createMint } from '@solana/spl-token'
import { Connection, Keypair } from '@solana/web3.js'
import { logNewMint } from './log'

export async function mintNewTokens(
    connection: Connection,
    payer: Keypair,
    mintKeypair: Keypair,
    asset: [string, string, string, string, number, number, Keypair],
) {
    const assetName = asset[0]
    const decimals = asset[4]
    const quantity = asset[5]

    const mint = await createMint(
        connection,
        payer,
        payer.publicKey,
        null, // freezeAuthority
        decimals,
        mintKeypair,
    );

    if (!mint.equals(mintKeypair.publicKey)) {
        throw new Error('Mint not created');
    }

    logNewMint(
        assetName.toUpperCase(),
        decimals,
        quantity,
        mintKeypair.publicKey,
    )
    return mint;
}
