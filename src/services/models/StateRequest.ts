import { ActorId } from "sails-js";

export interface StakeRequest {
    amount: number;
    sessionForAccount: ActorId | null
    // tokenAmount: number;
    // user: `0x${string}`;
    // date: string;
}   

// export interface StakeRequest {
//     amount: number;
//     tokenAmount: number;
//     user: `0x${string}`;
//     date: string;
// }