pub mod errors;
pub mod instructions;
pub mod states;

use anchor_lang::prelude::*;
use instructions::*;

declare_id!("4X1idCYPtEcmv7F6nn9Te1xzjTtPNm5JiR4f9ZUuGAvd");

#[program]
pub mod daniel_swap_program {
    use super::*;

    pub fn create_pool(ctx: Context<CreatePoolCtx>) -> Result<()> {
        instructions::create_pool(ctx)
    }

    pub fn fund_pool(ctx: Context<FundPoolCtx>, amount: u64) -> Result<()> {
        instructions::fund_pool(ctx, amount)
    }

    pub fn claim_pool(ctx: Context<ClaimPoolCtx>, amount: u64) -> Result<()> {
        instructions::claim_pool(ctx, amount)
    }

    /// this is intended to be in real production
    pub fn swap_using_constant_product_formula(ctx: Context<ConstantProductFormulaCtx>, amount_to_swap: u64) -> Result<()> {
        instructions::swap_using_constant_product_formula(ctx, amount_to_swap)
    }

    /// this is for requirement
    pub fn swap_using_constant_price_formula(ctx: Context<ConstantPriceFormulaCtx>, amount_to_swap: u64) -> Result<()> {
        instructions::swap_using_constant_price_formula(ctx, amount_to_swap)
    }
}