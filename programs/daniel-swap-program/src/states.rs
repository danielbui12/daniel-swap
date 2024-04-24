//! Swap program account state
use anchor_lang::{prelude::*, system_program};
use anchor_spl::token::{transfer, Mint, Token, TokenAccount, Transfer};
use std::ops::{Add, Div, Mul};

use crate::errors::DanielSwapProgramError;

#[account]
pub struct LiquidityPool {
    pub assets: Vec<Pubkey>,
    pub bump: u8,
}

impl LiquidityPool {
    pub const SEED_PREFIX: &'static [u8; 14] = b"liquidity_pool";

    pub const SPACE: usize = 8 // discriminator
      + 4 // Vec empty
      + 1 // u8
      ;

    /// Creates a blank `LiquidityPool`
    pub fn new(bump: u8) -> Self {
        Self {
            assets: vec![],
            bump,
        }
    }
}

pub trait LiquidityPoolAccount<'info> {
    fn check_asset_key(&self, key: &Pubkey) -> Result<()>;
    fn add_asset(
        &mut self,
        key: Pubkey,
        payer: &Signer<'info>,
        system_program: &Program<'info, System>,
    ) -> Result<()>;
    fn realloc(
        &mut self,
        space_to_add: usize,
        payer: &Signer<'info>,
        system_program: &Program<'info, System>,
    ) -> Result<()>;
    fn fund(
        &mut self,
        deposit: (
            &Account<'info, Mint>,
            &Account<'info, TokenAccount>,
            &Account<'info, TokenAccount>,
            u64,
        ),
        authority: &Signer<'info>,
        system_program: &Program<'info, System>,
        token_program: &Program<'info, Token>,
    ) -> Result<()>;
     fn claim(
        &mut self,
        token: (
            &Account<'info, TokenAccount>,
            &Account<'info, TokenAccount>,
            u64,
        ),
        token_program: &Program<'info, Token>,
    ) -> Result<()>;
    fn process_swap_constant_product_formula(
        &mut self,
        receive: (
            &Account<'info, Mint>,
            &Account<'info, TokenAccount>,
            &Account<'info, TokenAccount>,
        ),
        pay: (
            &Account<'info, Mint>,
            &Account<'info, TokenAccount>,
            &Account<'info, TokenAccount>,
            u64,
        ),
        authority: &Signer<'info>,
        token_program: &Program<'info, Token>,
    ) -> Result<()>;
  
    fn process_swap_constant_price_formula(
        &mut self,
        receive: (
            &Account<'info, Mint>,
            &Account<'info, TokenAccount>,
            &Account<'info, TokenAccount>,
        ),
        pay: (
            &Account<'info, Mint>,
            &Account<'info, TokenAccount>,
            &Account<'info, TokenAccount>,
            u64,
        ),
        reward_ratio: (u8, u8),
        authority: &Signer<'info>,
        token_program: &Program<'info, Token>,
    ) -> Result<()>;

    fn get_constant_price_ratio(&self, from: &Pubkey) -> (u8, u8);
}

impl<'info> LiquidityPoolAccount<'info> for Account<'info, LiquidityPool> {
    /// Validates an asset's key is present in the Liquidity Pool
    fn check_asset_key(&self, key: &Pubkey) -> Result<()> {
        if self.assets.contains(key) {
            Ok(())
        } else {
            Err(DanielSwapProgramError::InvalidAssetKey.into())
        }
    }

    fn add_asset(
        &mut self,
        key: Pubkey,
        payer: &Signer<'info>,
        system_program: &Program<'info, System>,
    ) -> Result<()> {
        match self.check_asset_key(&key) {
            Ok(()) => (),
            Err(_) => {
                self.realloc(32, payer, system_program)?;
                self.assets.push(key)
            }
        };
        Ok(())
    }

    fn realloc(
        &mut self,
        space_to_add: usize,
        payer: &Signer<'info>,
        system_program: &Program<'info, System>,
    ) -> Result<()> {
        let account_info = self.to_account_info();
        let new_account_size = account_info.data_len() + space_to_add;

        // Determine additional rent required
        let lamports_required = (Rent::get()?).minimum_balance(new_account_size);
        let additional_rent_to_fund = lamports_required - account_info.lamports();

        // Perform transfer of additional rent
        system_program::transfer(
            CpiContext::new(
                system_program.to_account_info(),
                system_program::Transfer {
                    from: payer.to_account_info(),
                    to: account_info.clone(),
                },
            ),
            additional_rent_to_fund,
        )?;

        // Reallocate the account
        account_info.realloc(new_account_size, false)?;
        Ok(())
    }

    fn fund(
        &mut self,
        deposit: (
            &Account<'info, Mint>,
            &Account<'info, TokenAccount>,
            &Account<'info, TokenAccount>,
            u64,
        ),
        authority: &Signer<'info>,
        system_program: &Program<'info, System>,
        token_program: &Program<'info, Token>,
    ) -> Result<()> {
        let (mint, from, to, amount) = deposit;
        self.add_asset(mint.key(), authority, system_program)?;
        process_transfer_to_pool(from, to, amount, authority, token_program)?;
        Ok(())
    }

    fn claim(
        &mut self,
        token: (
            &Account<'info, TokenAccount>,
            &Account<'info, TokenAccount>,
            u64,
        ),
        token_program: &Program<'info, Token>,
    ) -> Result<()> {
        let (from, to, amount) = token;
        process_transfer_from_pool(from, to, amount, self, token_program)?;
        Ok(())
    }

    fn process_swap_constant_product_formula(
        &mut self,
        receive: (
            &Account<'info, Mint>,
            &Account<'info, TokenAccount>,
            &Account<'info, TokenAccount>,
        ),
        pay: (
            &Account<'info, Mint>,
            &Account<'info, TokenAccount>,
            &Account<'info, TokenAccount>,
            u64,
        ),
        authority: &Signer<'info>,
        token_program: &Program<'info, Token>,
    ) -> Result<()> {
        // (A token, From, To)
        let (receive_mint, pool_receive, payer_receive) = receive;
        self.check_asset_key(&receive_mint.key())?;
        // (B token, From, To)
        let (pay_mint, payer_pay, pool_pay, pay_amount) = pay;
        self.check_asset_key(&pay_mint.key())?;
        // Determine the amount the payer will receive of the requested asset
        let receive_amount = constant_product_formula(
            pool_receive.amount,
            receive_mint.decimals,
            pool_pay.amount,
            pay_mint.decimals,
            pay_amount,
        )?;
        // Process the swap
        if receive_amount == 0 {
            Err(DanielSwapProgramError::InvalidPayAmount.into())
        } else {
            process_transfer_to_pool(payer_pay, pool_pay, pay_amount, authority, token_program)?;
            process_transfer_from_pool(
                pool_receive,
                payer_receive,
                receive_amount,
                self,
                token_program,
            )?;
            Ok(())
        }
    }

    fn process_swap_constant_price_formula(
        &mut self,
        receive: (
            &Account<'info, Mint>,
            &Account<'info, TokenAccount>,
            &Account<'info, TokenAccount>,
        ),
        pay: (
            &Account<'info, Mint>,
            &Account<'info, TokenAccount>,
            &Account<'info, TokenAccount>,
            u64,
        ),
        reward_ratio: (u8, u8),
        authority: &Signer<'info>,
        token_program: &Program<'info, Token>,
    ) -> Result<()> {
        // (B token, From, To)
        let (receive_mint, pool_receive, payer_receive) = receive;
        self.check_asset_key(&receive_mint.key())?;
        // (A token, From, To)
        let (pay_mint, payer_pay, pool_pay, pay_amount) = pay;
        self.check_asset_key(&pay_mint.key())?;
        // Determine the amount the payer will recieve of the requested asset
        let receive_amount = constant_price_formula(
            pool_receive.amount,
            receive_mint.decimals,
            pay_amount,
            pay_mint.decimals,
            reward_ratio.0,
            reward_ratio.1 
        )?;
        // Process the swap
        if receive_amount == 0 {
            Err(DanielSwapProgramError::InvalidPayAmount.into())
        } else {
            process_transfer_to_pool(payer_pay, pool_pay, pay_amount, authority, token_program)?;
            process_transfer_from_pool(
                pool_receive,
                payer_receive,
                receive_amount,
                self,
                token_program,
            )?;
            Ok(())
        }
    }

    /// for example let pool is SOL/MOVE
    fn get_constant_price_ratio(&self, from: &Pubkey) -> (u8, u8) {
        if self.assets[0].eq(from) {
            return (1, 10);
        }
        return (10, 1);
    }
}

/// Process a transfer from one the payer's token account to the
/// pool's token account using a CPI
fn process_transfer_to_pool<'info>(
    from: &Account<'info, TokenAccount>,
    to: &Account<'info, TokenAccount>,
    amount: u64,
    authority: &Signer<'info>,
    token_program: &Program<'info, Token>,
) -> Result<()> {
    transfer(
        CpiContext::new(
            token_program.to_account_info(),
            Transfer {
                from: from.to_account_info(),
                to: to.to_account_info(),
                authority: authority.to_account_info(),
            },
        ),
        amount,
    )
}

/// Process a transfer from the pool's token account to the
/// payer's token account using a CPI with signer seeds
fn process_transfer_from_pool<'info>(
    from: &Account<'info, TokenAccount>,
    to: &Account<'info, TokenAccount>,
    amount: u64,
    pool: &Account<'info, LiquidityPool>,
    token_program: &Program<'info, Token>,
) -> Result<()> {
    transfer(
        CpiContext::new_with_signer(
            token_program.to_account_info(),
            Transfer {
                from: from.to_account_info(),
                to: to.to_account_info(),
                authority: pool.to_account_info(),
            },
            &[&[LiquidityPool::SEED_PREFIX, &[pool.bump]]],
        ),
        amount,
    )
}

/// The constant-product formula
/// token A and token B
/// swap from A to B, provided a
///
/// Before:
/// K = A * B
/// After:
/// K = (A + a) * (B - b)
///
/// A * B = (A + a) * (B - b)
/// AB = AB - Ab + aB - ab
/// 0 = Ab - aB + ab
/// aB = b(A + a)
/// b = aB / (A + a)
/// b = (a * B) / (A + a)

fn constant_product_formula(
    pool_recieve_balance: u64,
    receive_decimals: u8,
    pool_pay_balance: u64,
    pay_decimals: u8,
    pay_amount: u64,
) -> Result<u64> {
    // convert to full decimals balance
    let big_b = convert_to_float(pool_recieve_balance, receive_decimals);
    let big_a = convert_to_float(pool_pay_balance, pay_decimals);
    let a = convert_to_float(pay_amount, pay_decimals);
    
    let bigb_times_a = big_b.mul(a);
    let biga_plus_a = big_a.add(a);
    let b = bigb_times_a.div(biga_plus_a);
    // Validate not exceed amount in pool
    if b > big_b {
        return Err(DanielSwapProgramError::OverLiquidityAllocatable.into());
    }

    Ok(convert_from_float(b, receive_decimals))
}

/// Fixed liquidity 1 SOL = 10 MOVEs
/// b = a * numerator / denominator
///

fn constant_price_formula(
    pool_recieve_balance: u64,
    receive_decimals: u8,
    pay_amount: u64,
    pay_decimals: u8,
    numerator: u8,
    denominator: u8,
) -> Result<u64> {
    let pool_balance = convert_to_float(pool_recieve_balance, receive_decimals);
    let pay_amount_w_decimals = convert_to_float(pay_amount, pay_decimals);
    let receive_amount = pay_amount_w_decimals.mul(numerator as f32).div(denominator as f32);
    if receive_amount > pool_balance {
        return Err(DanielSwapProgramError::OverLiquidityAllocatable.into());
    } 
    Ok(convert_from_float(receive_amount, pay_decimals))
}

/// For ex, a token account with a balance of 10,500 for a mint with 3
/// => decimals would have a nominal balance of 10.5
fn convert_to_float(value: u64, decimals: u8) -> f32 {
    (value as f32).div(f32::powf(10.0, decimals as f32))
}

/// Convert back to original number: 10.5 to 10,500 
fn convert_from_float(value: f32, decimals: u8) -> u64 {
    value.mul(f32::powf(10.0, decimals as f32)) as u64
}
