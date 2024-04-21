import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { use as chaiUse, expect } from "chai";
import * as anchor from '@coral-xyz/anchor'
import chaiAsPromised from "chai-as-promised";
import { CREATOR_KEYPAIR, SWAPPER_KEYPAIR } from './util/const';
import { boilerPlateReduction } from './util/utils';
import { ASSETS } from './util/const'
import { mintNewTokens } from "./util/token";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { PublicKey } from "@metaplex-foundation/js";

chaiUse(chaiAsPromised);

describe("Environment", () => {
    const provider = anchor.AnchorProvider.env()
    anchor.setProvider(provider)

    const assets_conf: any[] = []
    const payer = (provider.wallet as anchor.Wallet).payer
    const creator = CREATOR_KEYPAIR;
    const swapper = SWAPPER_KEYPAIR;
    const accounts = [payer, creator, swapper];
    // const defaultMintAmount = 10n ** 6n;

    console.log('payer', payer.publicKey.toString())
    console.log('creator', creator.publicKey.toString())
    console.log('swapper', swapper.publicKey.toString())

    const {
        requestAirdrop,
    } = boilerPlateReduction(provider.connection, payer);

    before("Airdrop", async function () {
        await Promise.all(accounts.map((kp) => kp.publicKey).map(requestAirdrop));
    });

    it("Check balance", async function() {
        for (const account of accounts) {
            expect(await provider.connection.getBalance(account.publicKey)).to.be.gte(1000 * LAMPORTS_PER_SOL);
        }
    })

    it('Creating Assets', async () => {
        for (const a of ASSETS) {
            await mintNewTokens(
                provider.connection,
                payer,
                a[6],
                a
            )
            
            assets_conf.push({
                name: a[0],
                decimals: a[4],
                quantity: a[5],
                keypair: {
                    publicKey: a[6].publicKey.toString(),
                    secretKey: [...a[6].secretKey],
                },
            })
        }
    });

    it("Create ATAs", async function () {
        for (const asset of assets_conf) {
            for (const account of accounts) {
                const func = getOrCreateAssociatedTokenAccount(
                    provider.connection,
                    account,
                    new PublicKey(asset.keypair.publicKey),
                    account.publicKey,
                );
                await expect(
                    func,
                ).to.be.fulfilled;

                console.log('new ata', (await func).address.toString(), 'of', account.publicKey.toString());
            }
        }
    });
});
