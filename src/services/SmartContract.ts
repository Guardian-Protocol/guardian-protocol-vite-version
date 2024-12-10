import { GearApi } from "@gear-js/api";
import {Account, AlertContainerFactory} from "@gear-js/react-hooks";
import {web3FromSource} from "@polkadot/extension-dapp";
import {ISubmittableResult} from "@polkadot/types/types";
import React from "react";
import { Program } from "./clients/liquidity/program";
import { TokenProgram } from "./clients/token/lib";
import { StakeRequest } from "./models/StateRequest";
import { UnstakeRequest } from "./models/UnstakeRequest";
import { WithdrawRequest } from "./models/WithdrawRequest";

type address = `0x${string}`

export class SmartContract {
    public readonly PLANK: number = 1000000000000;

    private api: GearApi;
    public alert: AlertContainerFactory;

    private account: Account | null;
    private accounts: any;

    private readonly stash: address;

    private readonly liquidityClient: Program;
    private readonly tokenClient: TokenProgram;

    private readonly BASE_URL: string;

    public getAlertStyle(): React.CSSProperties{
        const isMobile = window.innerWidth < 720;
        return {
            width: isMobile ? "70%" : "30%",
            height: "5%",
            margin: "20px",
            backgroundColor: "black",
            color: "white",
            border: "2px solid rgba(187, 128, 0, 0.95)"
        }
    };

    public readonly alertStyle = this.getAlertStyle();

    constructor(
        api: GearApi,
        account: Account,
        accounts: any,
        alert: AlertContainerFactory,
    ) {
        this.api = api;
        this.account = account;
        this.accounts = accounts;
        this.alert = alert;
        
        this.stash = import.meta.env.VITE_STASH_ADDRESS as address;
        this.liquidityClient = new Program(api, import.meta.env.VITE_CONTRACT_ADDRESS as address);
        this.tokenClient = new TokenProgram(api, import.meta.env.VITE_FT_CONTRACT_ADDRESS as address)

        this.BASE_URL = import.meta.env.VITE_BASE_URL as string;
    }

    public toFixed4 = (value: number): number => parseFloat(value.toFixed(4));
    public toPlank = (value: number): number => Math.round(value * this.PLANK);
    public currentUser = () => this.account;
    
    public loadingAlert = (message: string) => {
        return this.alert.loading(message, { style: this.alertStyle });
    };

    public errorAlert = (message: string) => {
        return this.alert.error(message, { style: this.alertStyle, timeout: 1500 });
    }

    public closeAlert = (id: string) => {
        this.alert.remove(id);
    }

    public async stake(payload: StakeRequest, whenSuccess: () => void) {        
        if (!this.validateAccount()) {
            throw new Error("Invalid account")
        }

        this.signer(this.api.tx.balances.transferKeepAlive(this.stash, payload.amount) as any, () => {
            this.alert.success("SUCCESSFUL TRANSACTION", {style: this.alertStyle});
            whenSuccess();

            const requestMode: RequestMode = "cors";

            const requestOptions = {
                method: "POST",
                mode: requestMode,
                headers: { 
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify(payload),
            };

            fetch(this.BASE_URL + "/guardian/stake", requestOptions);
        });
    }

    public async unstake(payload: UnstakeRequest, gas: bigint, whenSuccess: () => void) {
        const approve = this.tokenClient.vft.approve(
            this.liquidityClient.programId!, 
            payload.amount
        );

        const approveGas = await approve.withAccount(this.account?.decodedAddress!).transactionFee();
        const approveTx = approve.withGas(approveGas).extrinsic as any;

        await this.signer(approveTx, async () => {
            this.alert.success("SUCCESSFUL TRANSACTION", {style: this.alertStyle})
            whenSuccess();
            

            const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            };

            await fetch(this.BASE_URL + "/guardian/unstake", requestOptions);
        }, true)
    }

    public withdraw(payload: WithdrawRequest) {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }

        fetch(this.BASE_URL + "/guardian/withdraw", requestOptions);
    }

    public async stakeGas(payload: any) {
        return await this.liquidityClient.liquidity.stake(
            payload.amount,
            payload.gvaraAmount, 
            this.account?.decodedAddress!, 
            payload.date
        ).withAccount(this.account?.decodedAddress!).transactionFee();
    }

    public async unstakeGas(amount: any) {
        return await this.tokenClient.vft.approve(
            this.liquidityClient.programId!, 
            amount
        ).withAccount(this.account?.decodedAddress!).transactionFee();
    }

    public async withdrawGas(payload: any) {
        return await this.liquidityClient.liquidity.unstake(
            payload.amount, 
            payload.reward, 
            payload.user, 
            payload.date, 
            payload.liberationEra
        ).withAccount(this.account?.decodedAddress!).transactionFee();
    }

    public async getHistory() {
        return await this.liquidityClient.liquidity.transactionsOf(this.account?.decodedAddress!);
    }

    public async getUnstakeHistory() {
        return await this.liquidityClient.liquidity.unstakesOf(this.account?.decodedAddress!);
    }

    public async getCurrentEra(): Promise<number> {
        const option =  (await this.api?.query.staking.currentEra());
        return option.unwrap().toNumber();
    }

    public async balanceOf() {
        return Number(await this.tokenClient.vft.balanceOf(this.account?.decodedAddress!)) / this.PLANK;
    }

    public async tokenValue() { 
        return Number(await this.liquidityClient.liquidity.tokenValue());
    }

    private async signer(message: any, continueWith: () => void, isUnstake: boolean = false) {
        const injector = await web3FromSource(this.accounts[0]?.meta.source as string);

        await message.signAndSend(
            this.account?.address ?? this.alert.error("No account found", { style:  this.alertStyle }),
            { signer: injector.signer },
            (result: ISubmittableResult) => this.statusCallBack(result, continueWith, isUnstake)
        );
    }

    private statusCallBack({status}: ISubmittableResult, continueWith: () => void, isUnstake: boolean) {
        if (status.isInBlock && !isUnstake) {
            continueWith();
        } else if (status.isFinalized && isUnstake) {
            continueWith();
        }
    }

    private validateAccount(): boolean {
        const localAccount = this.account;
        return this.accounts.some(
            (visibleAccount: Account) => visibleAccount.address === localAccount?.address
        )
    }
}