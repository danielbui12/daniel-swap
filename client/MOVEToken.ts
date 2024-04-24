import { PublicKey } from "@metaplex-foundation/js";
import { ASSETS } from "../tests/util/const"
import { mintNewTokens } from "../tests/util/token"
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { connection, payer } from "./utils";
import { createCreateMetadataAccountV3Instruction, PROGRAM_ID as METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import { buildTransaction } from "../tests/util/transaction";

const target = new PublicKey("FmWhTtXMgYTfmR53xUwGn3ZNGeKT8hySQPfpDCC46k8R");

async function createToken() {
    await mintNewTokens(
        connection,
        payer,
        ASSETS[0][6],
        ASSETS[0]
    )
}

async function createTokenMetadata(mint: PublicKey) {
    const tx = await buildTransaction(
        connection,
        payer.publicKey,
        [payer],
        [createCreateMetadataAccountV3Instruction({
            metadata: PublicKey.findProgramAddressSync(
                [
                    Buffer.from('metadata'),
                    METADATA_PROGRAM_ID.toBuffer(),
                    mint.toBuffer(),
                ],
                METADATA_PROGRAM_ID
            )[0],
            mint: mint,
            mintAuthority: payer.publicKey,
            payer: payer.publicKey,
            updateAuthority: payer.publicKey,
        },
        {
            createMetadataAccountArgsV3: {
                data: {
                    name: ASSETS[0][0],
                    symbol: ASSETS[0][0],
                    uri: ASSETS[0][3],
                    creators: null,
                    sellerFeeBasisPoints: 0,
                    uses: null,
                    collection: null,
                },
                isMutable: false,
                collectionDetails: null,
            },
        })]
    );
    const txSig = await connection.sendTransaction(tx);
    const ltsBlock = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
        ...ltsBlock,
        signature: txSig,
    })
}

async function mintToken(mint: PublicKey) {
    const destination = await getOrCreateAssociatedTokenAccount(connection, payer, mint, target);
    await mintTo(
        connection,
        payer,
        mint,
        destination.address,
        payer,
        ASSETS[0][5] * 10 ** ASSETS[0][4],
    )
}

async function main() {
    // await createToken();
    // const mint = new PublicKey("ASdZagtrNjFoFTfd1kDKeFxFgbPenuFbepd1EVYXsyt4");
    // await createTokenMetadata(mint);
    // await mintToken(mint);
}

main().then(() => {
    console.log('done')
    process.exit(0)
}).catch((err) => {
    console.error(err)
    process.exit(1)
})