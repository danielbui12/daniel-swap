import { PublicKey, Keypair } from '@solana/web3.js';
export const MOVE_PROGRAM_ID = new PublicKey("ASdZagtrNjFoFTfd1kDKeFxFgbPenuFbepd1EVYXsyt4");
export const MOVE_AUTHORITY = Keypair.fromSecretKey(Uint8Array.from([
    51, 241, 237, 98, 246, 158, 41, 142, 99, 172, 167, 71, 254, 6, 85, 100, 154, 206, 76, 244, 150, 121, 77, 48, 152, 216, 197, 180, 115, 181, 75, 221, 203, 99, 54, 238, 85, 195, 32, 146, 7, 210, 246, 55, 178, 214, 242, 93, 183, 212, 104, 22, 115, 133, 139, 233, 87, 36, 128, 4, 141, 173, 130, 32
]))