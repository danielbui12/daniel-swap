use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token;

use crate::{states::*, errors::*};

pub fn swap_using_constant_price_formula(ctx: Context<ConstantPriceFormulaCtx>, amount_to_swap: u64) -> Result<()> {
    // Make sure the amount is not zero
    if amount_to_swap == 0 {
        return Err(DanielSwapProgramError::InvalidSwapZeroAmount.into());
    }

    let pool = &mut ctx.accounts.pool;

    // Receive: The assets the user is requesting to receive in exchange:
    // (Token, Mint, From, To)
    let receive = (
        ctx.accounts.receive_mint.as_ref(),
        ctx.accounts.pool_receive_token_account.as_ref(),
        ctx.accounts.payer_receive_token_account.as_ref(),
    );

    // Pay: The assets the user is proposing to pay in the swap:
    // (Mint, From, To, Amount)
    let pay = (
        ctx.accounts.pay_mint.as_ref(),
        ctx.accounts.payer_pay_token_account.as_ref(),
        ctx.accounts.pool_pay_token_account.as_ref(),
        amount_to_swap,
    );

    let reward_ratio = pool.get_constant_price_ratio(&ctx.accounts.pay_mint.key());

    pool.process_swap_constant_price_formula(
        receive,
        pay,
        reward_ratio,
        &ctx.accounts.payer,
        &ctx.accounts.token_program,
    )
}

#[derive(Accounts)]
pub struct ConstantPriceFormulaCtx<'info> {
    #[account(
        mut,
        seeds = [LiquidityPool::SEED_PREFIX],
        bump = pool.bump,
    )]
    pub pool: Account<'info, LiquidityPool>,
 
    #[account(
        constraint = !receive_mint.key().eq(&pay_mint.key()) @ DanielSwapProgramError::InvalidSwapAssets
    )]
    pub receive_mint: Box<Account<'info, token::Mint>>,
 
    #[account(
        mut,
        associated_token::mint = receive_mint,
        associated_token::authority = pool,
    )]
    pub pool_receive_token_account: Box<Account<'info, token::TokenAccount>>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = receive_mint,
        associated_token::authority = payer,
    )]
    pub payer_receive_token_account: Box<Account<'info, token::TokenAccount>>,

    pub pay_mint: Box<Account<'info, token::Mint>>,

    #[account(
        mut,
        associated_token::mint = pay_mint,
        associated_token::authority = pool,
    )]
    pub pool_pay_token_account: Box<Account<'info, token::TokenAccount>>,
   
    #[account(
        mut,
        associated_token::mint = pay_mint,
        associated_token::authority = payer,
    )]
    pub payer_pay_token_account: Box<Account<'info, token::TokenAccount>>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub token_program: Program<'info, token::Token>,

    pub system_program: Program<'info, System>,

    pub associated_token_program: Program<'info, AssociatedToken>,
}
