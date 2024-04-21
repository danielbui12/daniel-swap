use anchor_lang::prelude::*;
use anchor_spl::{associated_token, token};

use crate::states::*;

pub fn fund_pool(ctx: Context<FundPoolCtx>, amount: u64) -> Result<()> {
    let pool = &mut ctx.accounts.pool;

    // (Token, From, To, amount)
    let deposit = (
        &ctx.accounts.mint,
        &ctx.accounts.payer_token_account,
        &ctx.accounts.pool_token_account,
        amount,
    );

    pool.fund(
        deposit,
        &ctx.accounts.payer,
        &ctx.accounts.system_program,
        &ctx.accounts.token_program,
    )
}

#[derive(Accounts)]
pub struct FundPoolCtx<'info> {
    /// Liquidity Pool
    #[account(
        mut,
        seeds = [LiquidityPool::SEED_PREFIX],
        bump = pool.bump,
    )]
    pub pool: Account<'info, LiquidityPool>,
    /// The asset is deposited into the pool
    pub mint: Account<'info, token::Mint>,
    /// The Liquidity Pool's ata
    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = pool,
    )]
    pub pool_token_account: Account<'info, token::TokenAccount>,
    /// The payer's ata
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = payer,
    )]
    pub payer_token_account: Account<'info, token::TokenAccount>,
    // Payer
    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,

    pub token_program: Program<'info, token::Token>,

    pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
}
