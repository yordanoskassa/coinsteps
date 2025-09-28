use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod step_betting {
    use super::*;

    pub fn create_challenge(
        ctx: Context<CreateChallenge>,
        target_steps: u64,
        stake_amount: u64,
        duration_hours: u64,
        oracle: Pubkey,
    ) -> Result<()> {
        let challenge = &mut ctx.accounts.challenge;
        let clock = Clock::get()?;
        
        challenge.creator = ctx.accounts.creator.key();
        challenge.target_steps = target_steps;
        challenge.stake_amount = stake_amount;
        challenge.start_time = clock.unix_timestamp;
        challenge.end_time = clock.unix_timestamp + (duration_hours as i64 * 3600);
        challenge.is_active = true;
        challenge.winner = None;
        challenge.winner_steps = 0;
        challenge.participants = vec![ctx.accounts.creator.key()];
        challenge.total_pool = stake_amount;
        challenge.oracle = oracle;
        challenge.expired = false;
        challenge.completed_at = 0;
        
        // Transfer stake from creator to challenge escrow
        let cpi_accounts = Transfer {
            from: ctx.accounts.creator_token_account.to_account_info(),
            to: ctx.accounts.challenge_escrow.to_account_info(),
            authority: ctx.accounts.creator.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, stake_amount)?;
        
        msg!("Challenge created: {} steps, {} SOL stake", target_steps, stake_amount);
        Ok(())
    }

    pub fn join_challenge(
        ctx: Context<JoinChallenge>,
    ) -> Result<()> {
        let challenge = &mut ctx.accounts.challenge;
        
        require!(challenge.is_active, ErrorCode::ChallengeNotActive);
        require!(
            !challenge.participants.contains(&ctx.accounts.participant.key()),
            ErrorCode::AlreadyParticipating
        );
        
        // Transfer stake from participant to challenge escrow
        let cpi_accounts = Transfer {
            from: ctx.accounts.participant_token_account.to_account_info(),
            to: ctx.accounts.challenge_escrow.to_account_info(),
            authority: ctx.accounts.participant.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, challenge.stake_amount)?;
        
        challenge.participants.push(ctx.accounts.participant.key());
        challenge.total_pool += challenge.stake_amount;
        
        msg!("Participant joined challenge: {}", ctx.accounts.participant.key());
        Ok(())
    }

    pub fn declare_winner(
        ctx: Context<DeclareWinner>,
        winner_pubkey: Pubkey,
        verified_steps: u64,
    ) -> Result<()> {
        let challenge = &mut ctx.accounts.challenge;
        let clock = Clock::get()?;
        
        require!(challenge.is_active, ErrorCode::ChallengeNotActive);
        require!(
            challenge.participants.contains(&winner_pubkey),
            ErrorCode::NotParticipating
        );
        require!(verified_steps >= challenge.target_steps, ErrorCode::InsufficientSteps);
        
        // Only allow oracle (off-chain verifier) to declare winner
        require!(
            ctx.accounts.oracle.key() == challenge.oracle,
            ErrorCode::UnauthorizedOracle
        );
        
        // Declare winner and end challenge
        challenge.winner = Some(winner_pubkey);
        challenge.winner_steps = verified_steps;
        challenge.is_active = false;
        challenge.completed_at = clock.unix_timestamp;
        
        msg!("Winner declared: {} with {} verified steps", winner_pubkey, verified_steps);
        Ok(())
    }

    pub fn force_expire(
        ctx: Context<ForceExpire>,
    ) -> Result<()> {
        let challenge = &mut ctx.accounts.challenge;
        let clock = Clock::get()?;
        
        require!(challenge.is_active, ErrorCode::ChallengeNotActive);
        require!(clock.unix_timestamp > challenge.end_time, ErrorCode::ChallengeNotExpired);
        
        // Challenge expired without winner - mark for refunds
        challenge.is_active = false;
        challenge.expired = true;
        
        msg!("Challenge expired without winner - refunds available");
        Ok(())
    }

    pub fn claim_winnings(
        ctx: Context<ClaimWinnings>,
    ) -> Result<()> {
        let challenge = &ctx.accounts.challenge;
        
        require!(!challenge.is_active, ErrorCode::ChallengeStillActive);
        require!(
            challenge.winner == Some(ctx.accounts.winner.key()),
            ErrorCode::NotWinner
        );
        
        // Transfer entire pool to winner
        let bump = ctx.bumps.challenge_escrow;
        let seeds = &[
            b"challenge_escrow",
            challenge.key().as_ref(),
            &[bump],
        ];
        let signer = &[&seeds[..]];
        
        let cpi_accounts = Transfer {
            from: ctx.accounts.challenge_escrow.to_account_info(),
            to: ctx.accounts.winner_token_account.to_account_info(),
            authority: ctx.accounts.challenge_escrow.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, challenge.total_pool)?;
        
        msg!("Winnings claimed: {} SOL", challenge.total_pool);
        Ok(())
    }

    pub fn refund_expired(
        ctx: Context<RefundExpired>,
    ) -> Result<()> {
        let challenge = &ctx.accounts.challenge;
        
        require!(!challenge.is_active, ErrorCode::ChallengeStillActive);
        require!(challenge.expired, ErrorCode::ChallengeNotExpired);
        require!(challenge.winner.is_none(), ErrorCode::ChallengeHasWinner);
        require!(
            challenge.participants.contains(&ctx.accounts.participant.key()),
            ErrorCode::NotParticipating
        );
        
        // Refund stake to participant
        let bump = ctx.bumps.challenge_escrow;
        let seeds = &[
            b"challenge_escrow",
            challenge.key().as_ref(),
            &[bump],
        ];
        let signer = &[&seeds[..]];
        
        let cpi_accounts = Transfer {
            from: ctx.accounts.challenge_escrow.to_account_info(),
            to: ctx.accounts.participant_token_account.to_account_info(),
            authority: ctx.accounts.challenge_escrow.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, challenge.stake_amount)?;
        
        msg!("Refund processed for expired challenge");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateChallenge<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + Challenge::INIT_SPACE,
        seeds = [b"challenge", creator.key().as_ref()],
        bump
    )]
    pub challenge: Account<'info, Challenge>,
    
    #[account(
        init,
        payer = creator,
        seeds = [b"challenge_escrow", challenge.key().as_ref()],
        bump,
        token::mint = sol_mint,
        token::authority = challenge_escrow,
    )]
    pub challenge_escrow: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub creator: Signer<'info>,
    
    #[account(mut)]
    pub creator_token_account: Account<'info, TokenAccount>,
    
    pub sol_mint: Account<'info, token::Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct JoinChallenge<'info> {
    #[account(mut)]
    pub challenge: Account<'info, Challenge>,
    
    #[account(mut)]
    pub challenge_escrow: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub participant: Signer<'info>,
    
    #[account(mut)]
    pub participant_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct DeclareWinner<'info> {
    #[account(mut)]
    pub challenge: Account<'info, Challenge>,
    
    pub oracle: Signer<'info>,
}

#[derive(Accounts)]
pub struct ForceExpire<'info> {
    #[account(mut)]
    pub challenge: Account<'info, Challenge>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ClaimWinnings<'info> {
    #[account(mut)]
    pub challenge: Account<'info, Challenge>,
    
    #[account(
        mut,
        seeds = [b"challenge_escrow", challenge.key().as_ref()],
        bump
    )]
    pub challenge_escrow: Account<'info, TokenAccount>,
    
    pub winner: Signer<'info>,
    
    #[account(mut)]
    pub winner_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RefundExpired<'info> {
    #[account(mut)]
    pub challenge: Account<'info, Challenge>,
    
    #[account(
        mut,
        seeds = [b"challenge_escrow", challenge.key().as_ref()],
        bump
    )]
    pub challenge_escrow: Account<'info, TokenAccount>,
    
    pub participant: Signer<'info>,
    
    #[account(mut)]
    pub participant_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[account]
#[derive(InitSpace)]
pub struct Challenge {
    pub creator: Pubkey,
    pub target_steps: u64,
    pub stake_amount: u64,
    pub start_time: i64,
    pub end_time: i64,
    pub is_active: bool,
    pub winner: Option<Pubkey>,
    pub winner_steps: u64,
    #[max_len(10)]
    pub participants: Vec<Pubkey>,
    pub total_pool: u64,
    pub oracle: Pubkey,
    pub expired: bool,
    pub completed_at: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Challenge is not active")]
    ChallengeNotActive,
    #[msg("Already participating in this challenge")]
    AlreadyParticipating,
    #[msg("Challenge has expired")]
    ChallengeExpired,
    #[msg("Not participating in this challenge")]
    NotParticipating,
    #[msg("Insufficient steps to win")]
    InsufficientSteps,
    #[msg("Challenge is still active")]
    ChallengeStillActive,
    #[msg("Not the winner of this challenge")]
    NotWinner,
    #[msg("Challenge has not expired yet")]
    ChallengeNotExpired,
    #[msg("Challenge already has a winner")]
    ChallengeHasWinner,
    #[msg("Unauthorized oracle")]
    UnauthorizedOracle,
}
