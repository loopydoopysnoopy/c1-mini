use {
    solana_program::{
        account_info::AccountInfo, entrypoint, entrypoint::ProgramResult, msg,
        program_error::ProgramError, pubkey::Pubkey,
    },
    std::str::from_utf8,
};

// declare and export the program's entrypoint
entrypoint!(process_instruction);

// program entrypoint's implementation
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    memo_input: &[u8],
) -> ProgramResult {
    // log memo to the blockchain
    let memo = from_utf8(memo_input).map_err(|err| {
        msg!("Invalid UTF-8, from byte {}", err.valid_up_to());
        ProgramError::InvalidInstructionData
    })?;
    msg!("Memo (len {}): {:?}", memo.len(), memo);

    // gracefully exit the program
    Ok(())
}
