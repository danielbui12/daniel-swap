import { Connection } from "@solana/web3.js";
import { DANIEL_SWAP_PROGRAM_ID, createDanielSwapProgram } from "../program";
import { PublicKey } from "@metaplex-foundation/js";
import { getAssociatedTokenAddressSync, getMultipleAccounts, Account as TokenAccount } from "@solana/spl-token";

export interface LiquidityPool {
    assets: PublicKey[];
    bump: number;
};

export function deriveLiquidityPoolPDA(programId: PublicKey = DANIEL_SWAP_PROGRAM_ID) {
    return PublicKey.findProgramAddressSync(
        [
            Buffer.from("liquidity_pool"),
        ],
        programId,
    )[0];
}

export async function fetchPools(
    connection: Connection,
    programId: PublicKey = DANIEL_SWAP_PROGRAM_ID,
): Promise<LiquidityPool[]> {
    const data = await createDanielSwapProgram(
        connection,
        programId,
    ).account.liquidityPool.all();

    return data as unknown as LiquidityPool[];
}

export async function fetchPool(
    connection: Connection,
    poolAddress: PublicKey,
    programId: PublicKey = DANIEL_SWAP_PROGRAM_ID,
): Promise<LiquidityPool> {
    const data = await createDanielSwapProgram(
        connection,
        programId,
    ).account.liquidityPool.fetch(poolAddress);

    return data as LiquidityPool;
}
