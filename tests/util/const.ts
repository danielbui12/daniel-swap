import { PublicKey } from "@metaplex-foundation/js";
import { Keypair } from "@solana/web3.js";
import fs from 'fs';

// (Name, Symbol, description, URI, decimals, amount, Keypair)
export const ASSETS: [string, string, string, string, number, number, Keypair][] = [
    [
        'MOVE',
        'MOVE',
        '',
        'https://raw.githubusercontent.com/danielbui12/remitano-interview-round2/master/tests/util/asset-metadata.json',
        9,
        1000,
        Keypair.fromSecretKey(Uint8Array.from([
            32, 88, 188, 246, 199, 254, 9, 244, 49, 230,
            67, 203, 42, 35, 143, 229, 130, 198, 161, 249,
            6, 50, 187, 97, 38, 15, 242, 118, 181, 231, 121,
            75, 140, 74, 11, 5, 140, 55, 32, 162, 140, 21, 40,
            12, 193, 184, 244, 171, 109, 3, 204, 121, 220, 55,
            132, 169, 216, 254, 66, 231, 128, 42, 209, 1
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
