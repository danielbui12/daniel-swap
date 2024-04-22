import { PublicKey } from "@metaplex-foundation/js";
import { ASSETS } from "../tests/util/const"
import { mintNewTokens } from "../tests/util/token"
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { connection, payer } from "./utils";

const target = new PublicKey("FmWhTtXMgYTfmR53xUwGn3ZNGeKT8hySQPfpDCC46k8R");

async function createToken() {
    await mintNewTokens(
        connection,
        payer,
        ASSETS[0][6],
        ASSETS[0]
    )
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
    // await mintToken(new PublicKey("ASdZagtrNjFoFTfd1kDKeFxFgbPenuFbepd1EVYXsyt4"));
}

main().then(() => {
    console.log('done')
    process.exit(0)
}).catch((err) => {
    console.error(err)
    process.exit(1)
})