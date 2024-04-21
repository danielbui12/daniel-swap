import { PublicKey } from "@metaplex-foundation/js";
import { Keypair } from "@solana/web3.js";
import fs from 'fs';

// (Name, decimals, description, URI, decimals, amount, Keypair)
export const ASSETS: [string, string, string, string, number, number, Keypair][] = [
    [
        'MOVE',
        'MOVE',
        '',
        'https://arweave.net/ArreGQ6DYdIPGs_KiwVXE7AMVclLliICTlls6Ff8DbY',
        9,
        10000,
        Keypair.fromSecretKey(Uint8Array.from([
            129, 227, 235, 186, 104, 13, 185, 244, 16, 185, 108, 95, 83, 214, 115,
            244, 194, 207, 250, 150, 180, 86, 70, 198, 97, 40, 71, 3, 26, 185, 48,
            222, 226, 136, 99, 75, 72, 182, 148, 76, 211, 140, 155, 55, 62, 44, 71,
            127, 72, 42, 114, 4, 86, 16, 64, 54, 37, 143, 66, 162, 104, 70, 220, 47,
        ]))
    ],
]

export const CREATOR_KEYPAIR = Keypair.fromSecretKey(
    Uint8Array.from([
        254, 235, 184, 105, 233, 46, 195, 139, 100, 228, 250, 168, 189, 240, 52,
        175, 210, 54, 179, 88, 131, 96, 68, 94, 231, 235, 251, 161, 19, 204, 172,
        99, 8, 208, 241, 39, 121, 229, 221, 10, 204, 191, 77, 40, 79, 116, 150, 148,
        65, 191, 106, 222, 167, 91, 235, 217, 175, 118, 43, 122, 137, 160, 239, 142,
    ]),
);

export const SWAPPER_KEYPAIR = Keypair.fromSecretKey(
    Uint8Array.from([
        232, 33, 124, 16, 208, 115, 111, 65, 155, 7, 36, 225, 29, 33, 239, 179, 255,
        29, 24, 173, 5, 59, 132, 255, 248, 85, 146, 109, 119, 235, 135, 96, 194,
        145, 178, 87, 185, 99, 164, 121, 187, 197, 165, 106, 166, 82, 84, 148, 166,
        215, 8, 230, 40, 255, 42, 214, 28, 134, 121, 201, 157, 42, 252, 165,
    ]),
);

export const DANIEL_SWAP_PROGRAM_KEYPAIR = Keypair.fromSecretKey(
    Uint8Array.from(
        JSON.parse(
            fs.readFileSync(
                'target/deploy/daniel_swap_program-keypair.json',
                { encoding: 'utf8'}
            )
        )
    )
);

export const W_SOLANA_MINT = new PublicKey("So11111111111111111111111111111111111111112");
