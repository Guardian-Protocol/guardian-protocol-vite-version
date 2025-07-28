// export global {;
//   export type LiquidityEvent = 
//     | { staked: number | string | bigint }
//     | { unstaked: number | string | bigint }
//     | { withdrawn: number | string | bigint }
//     | { newTokenValue: number | string | bigint }
//     | { adminAdded: null };

//   export type LiquidError = "notEnoughBalance" | "unstakeNotFound" | "withdrawNotFound" | "withdrawIsNotReady" | "zeroAmount" | "zeroEra" | "zeroId" | "zeroAddress" | "notAdmin" | "adminAlreadyExists" | "fTContractError" | "storeError";

//   export interface Transaction {
//     id: number | string | bigint;
//     t_type: string;
//     amount: number | string | bigint;
//     date: string;
//   }

//   export interface Unstake {
//     id: number | string | bigint;
//     amount: number | string | bigint;
//     reward: number | string | bigint;
//     liberation_era: number | string | bigint;
//     token_value_at: number | string | bigint;
//   }

// };

import { ActorId } from 'sails-js';

declare global {
  export interface Config {
    gas_to_delete_session: number | string | bigint;
    minimum_session_duration_ms: number | string | bigint;
    ms_per_block: number | string | bigint;
  }

  export type LiquidityEvent = 
    | { staked: number | string | bigint }
    | { unstaked: number | string | bigint }
    | { withdrawn: number | string | bigint }
    | { newTokenValue: number | string | bigint }
    | { adminAdded: null }
    | { adminRemoved: null };

  export type LiquidError = 
    | { notEnoughBalance: null }
    | { unstakeNotFound: null }
    | { withdrawNotFound: null }
    | { withdrawIsNotReady: null }
    | { zeroAmount: null }
    | { zeroEra: null }
    | { zeroId: null }
    | { zeroAddress: null }
    | { notAdmin: null }
    | { adminAlreadyExists: null }
    | { fTContractError: null }
    | { storeError: null }
    | { cantRemoveSelf: null }
    | { adminNotFound: null }
    | { lastAdmin: null }
    | { stakingError: StakingError };

  export type StakingError = 
    | { contractEraIsNotSynchronized: null }
    | { actionOnlyForAdmins: null }
    | { valueIsZero: null }
    | { valueLessThanOne: null }
    | { errorInFirstStageMessage: string }
    | { errorInUpstreamProgram: null }
    | { replyError: { payload: string; reason: string } }
    | { tokensReadyToWithdraw: null }
    | { tokensAlreadyWithdrawn: null }
    | { tokensAlreadyRebonded: null }
    | { unbondIdDoesNotExists: null }
    | { bondIdOverflow: null }
    | { unbondIdAlreadyWithdrawn: number | string | bigint }
    | { unbondIdWasRebonded: number | string | bigint }
    | { unbondIdOverflow: null }
    | { unbondIdCanNotBeWithdraw: { can_withdraw_at_block: number | string | bigint; current_block: number | string | bigint } }
    | { rebondIdOverflow: null }
    | { userBondOverflow: null }
    | { userBondUnderflow: null }
    | { userUnbondOverflow: null }
    | { userUnbondUnderflow: null }
    | { userInsufficientBond: null }
    | { userHasNoBonds: null }
    | { userHasNoUnbonds: null }
    | { nominateAtLeastOneAddress: null }
    | { nominationsAmountError: { max: number; received: number } };

  export interface Transaction {
    id: number | string | bigint;
    t_type: string;
    amount: number | string | bigint;
    date: string;
  }

  export interface Unstake {
    id: number | string | bigint;
    amount: number | string | bigint;
    reward: number | string | bigint;
    liberation_era: number | string | bigint;
    token_value_at: number | string | bigint;
  }

  export interface SignatureData {
    key: ActorId;
    duration: number | string | bigint;
    allowed_actions: Array<ActionsForSession>;
  }

  export type ActionsForSession = "stake" | "unstake" | "withdraw";

  export interface SessionData {
    key: ActorId;
    expires: number | string | bigint;
    allowed_actions: Array<ActionsForSession>;
    expires_at_block: number;
  }
};