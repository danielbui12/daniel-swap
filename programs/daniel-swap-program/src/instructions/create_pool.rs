use anchor_lang::prelude::*;

use crate::states::*;

pub fn create_pool(ctx: Context<CreatePoolCtx>) -> Result<()> {
    ctx.accounts.pool.set_inner(LiquidityPool::new(
        *ctx.bumps
            .get("pool")
            .expect("Failed to fetch bump for `pool`"),
    ));
    Ok(())
}

#[derive(Accounts)]
pub struct CreatePoolCtx<'info> {
    #[account(
        init,
        space = LiquidityPool::SPACE,
        payer = payer,
        seeds = [LiquidityPool::SEED_PREFIX],
        bump,
    )]
    pub pool: Account<'info, LiquidityPool>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}
