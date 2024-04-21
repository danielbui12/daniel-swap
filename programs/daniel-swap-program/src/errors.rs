use anchor_lang::prelude::*;

#[error_code]
pub enum DanielSwapProgramError {
    #[msg("Invalid asset key")]
    InvalidAssetKey,

    #[msg("Invalid amount payment")]
    InvalidPayAmount,

    #[msg("Invalid amount allocatable")]
    OverLiquidityAllocatable,

    #[msg("Asset key cannot be the same")]
    InvalidSwapAssets,

    #[msg("Zero amount")]
    InvalidSwapZeroAmount,
}
