import { ActorId } from "sails-js";

export interface UnstakeRequest {
    amount: number;
    sessionForAccount: ActorId | null
    // reward: number;
    // user: `0x${string}`;
    // date: string;
    // liberationEra: number;
}