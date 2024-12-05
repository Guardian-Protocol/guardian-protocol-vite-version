export interface UnstakeRequest {
    amount: number;
    reward: number;
    user: `0x${string}`;
    date: string;
    liberationEra: number;
}