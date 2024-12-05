export global {;
  export type LiquidityEvent = 
    | { staked: number | string | bigint }
    | { unstaked: number | string | bigint }
    | { withdrawn: number | string | bigint }
    | { newTokenValue: number | string | bigint }
    | { adminAdded: null };

  export type LiquidError = "notEnoughBalance" | "unstakeNotFound" | "withdrawNotFound" | "withdrawIsNotReady" | "zeroAmount" | "zeroEra" | "zeroId" | "zeroAddress" | "notAdmin" | "adminAlreadyExists" | "fTContractError" | "storeError";

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

};