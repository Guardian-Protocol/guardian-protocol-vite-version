import {GasInfo, GearApi, GearKeyring, ProgramMetadata} from "@gear-js/api";
import {Account, AlertContainerFactory} from "@gear-js/react-hooks";
import {SubmittableExtrinsic} from "@polkadot/api/promise/types";
import {web3FromSource} from "@polkadot/extension-dapp";
import {AnyJson, ISubmittableResult} from "@polkadot/types/types";
import React from "react";

type address = `0x${string}`
type promiseXt = Promise<SubmittableExtrinsic | null>

export class SmartContract {
    public readonly plat: number = 1000000000000;

    private api: GearApi;

    private account: Account | null;
    private accounts: any;

    public alert: AlertContainerFactory;
    private readonly admin: address;
    private readonly stash: address;

    private readonly source: address;
    private readonly metadata: ProgramMetadata;

    private readonly ftSource: address;
    private readonly ftMetadata: ProgramMetadata;

    public getAlertStyle(): React.CSSProperties{
        const isMobile = window.innerWidth < 720;
        return{
            width: isMobile ? "70%" : "30%",
            height: "5%",
            margin: "20px",
            backgroundColor: "rgba(213,145,0,0.95)"
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

        const { seed } = GearKeyring.generateSeed(import.meta.env.VITE_ADMIN_NMONIC as address);
        this.admin = seed

        this.stash = import.meta.env.VITE_STASH_ADDRESS as address;

        this.source = import.meta.env.VITE_CONTRACT_ADDRESS as address;
        this.metadata = ProgramMetadata.from(import.meta.env.VITE_CONTRACT_METADATA as address);

        this.ftSource = import.meta.env.VITE_FT_CONTRACT_ADDRESS as address;
        this.ftMetadata = ProgramMetadata.from(import.meta.env.VITE_FT_CONTRACT_METADATA as address);
    }

    public toFixed4 = (value: number): number => parseFloat(value.toFixed(4));
    public toPlank = (value: number): number => Math.round(value * this.plat);
    
    public loadingAlert = (message: string, timeout: number, callback: () => void) => {
        this.alert.loading(message, { style: this.alertStyle, timeout: timeout });
        callback();
    };

    public currentUser = () => this.account;

    public async stake(payload: AnyJson, amount: number, gasLimit: number, whenSuccess: () => void) {
        const transferMessage = this.api.tx.balances.transferKeepAlive(this.stash, amount);

        await this.signer(transferMessage, async () => {
            const stakeMessage = await this.contractMessage(payload, 0, gasLimit);
            const stakeTx = this.api.tx.staking.bondExtra(amount);
            const proxyTX = this.api.tx.proxy.proxy(this.stash, null, stakeTx);
            const batch = this.api.tx.utility.batch([stakeMessage!, proxyTX]);

            await this.proxySigner(batch, () => {
                this.alert.success("SUCCESSFUL TRANSACTION", {style: this.alertStyle})
                whenSuccess();
            });
        });
    }

    public async unstake(payload: AnyJson, value: number, amount: number, whenSuccess: () => void) {
        const unstakeMessage = await this.contractMessage(payload, 0, 0.6 * this.plat);
        const unboundTX = this.api.tx.staking.unbond(amount);
        const proxyTX = this.api.tx.proxy.proxy(this.stash, null, unboundTX);
        const batch = this.api.tx.utility.batch([unstakeMessage!, proxyTX]);

        await this.proxySigner(batch, async () => {
            this.alert.success("SUCCESSFUL TRANSACTION", {style: this.alertStyle})
            whenSuccess();
        });
    }

    public async withdraw(payload: AnyJson, liberationEra: number, amount: number) {
        const currentEra = await this.getCurrentEra();
        const withdrawMessage = await this.contractMessage(payload, 0, 0.06 * this.plat);

        await this.proxySigner(withdrawMessage!, async () => {
            if (currentEra >= liberationEra) {
                const withdrawTX = this.api.tx.staking.withdrawUnbonded(0);
                const proxyTX = this.api.tx.proxy.proxy(this.stash, null, withdrawTX);
                await this.proxySigner(proxyTX, async () => {
                    const transferMessage = this.api.tx.balances.transferKeepAlive(this.account?.decodedAddress!, amount);
                    const transferTX = this.api.tx.proxy.proxy(this.stash, null, transferMessage);
                    await this.proxySigner(transferTX, () => {
                        this.alert.success("SUCCESSFUL TRANSACTION", {style: this.alertStyle})
                    });
                });
            } else {
                this.alert.error("WITHDRAW IS NOT READY", {style: this.alertStyle})
            }
        });
    }

    public async getHistory() {
        const result = (await this.getState({ TransactionsOf: this.account?.decodedAddress }));
        return result === 0 ? 0 : result.asTransactions.toJSON();
    }

    public async getUnstakeHistory() {
        const result = (await this.getState({ UnstakesOf: this.account?.decodedAddress }));
        return result === 0 ? 0 : result.asUnstakes.toJSON();
    }

    public async getCurrentEra(): Promise<number> {
        const option =  (await this.api?.query.staking.currentEra());
        return option.unwrap().toNumber();
    }

    public async balanceOf() {
        const result = await this.getFTState();
        
        if (result === 0) {
            return 0;
        }

        return result.toNumber() / this.plat;
    }

    public async tokenValue() { 
        const state = await this.api.programState.read({
            programId: this.source,
            payload: {
                GuardianInfo: null
            }
        }, this.metadata);

        return (state.toJSON() as any).ok.liquidInfo.tokenValue;
    }

    public async getGassLimit(payload: AnyJson, amount: number) {
        const calculatedGas = await this.api.program.calculateGas.handle(
            this.account?.decodedAddress!,
            this.source,
            payload,
            amount,
            false,
            this.metadata
        );

        const gasToSpend = (gasInfo: GasInfo): bigint => {
            const gasHuman = gasInfo.toHuman();
            const minLimit = gasHuman.min_limit?.toString() ?? "0";
            const parsedGas = Number(minLimit.replaceAll(',', ''));
            const gasFix = Math.round(parsedGas + parsedGas * 10);
            const gasLimit: bigint = BigInt(gasFix);
            return gasLimit;
        }        

        return gasToSpend(calculatedGas);
    }

    private async getState(payload: AnyJson = {}) {
        const state = await this.api?.programState.read({
            programId: this.source,
            payload,
        }, this.metadata);

        if ((state as any).isErr) {
            return 0;
        }

        return (state as any).asOk;
    }


    private async getFTState(): Promise<any> {
        try {
            const state = await this.api?.programState.read({
                programId: this.ftSource,
                payload: {
                    BalanceOf: this.account?.decodedAddress
                }
            }, this.ftMetadata)

            if ((state as any).isErr) {
                return 0;
            }

            return (state as any).asOk.asBalance
        } catch {}
    }

    private async signer(message: SubmittableExtrinsic, continueWith: () => void) {
        const injector = await web3FromSource(this.accounts[0]?.meta.source as string);

        await message.signAndSend(
            this.account?.address ?? this.alert.error("No account found", { style:  this.alertStyle }),
            { signer: injector.signer },
            (result) => this.statusCallBack(result, continueWith)
        );
    }

    private async proxySigner(message: SubmittableExtrinsic, continueWith: () => void) {
        const keyring = await GearKeyring.fromSeed(this.admin);

        await message.signAndSend(keyring, result => {
            this.statusCallBack(result, continueWith)
        });
    }

    private statusCallBack({status}: ISubmittableResult, continueWith: () => void) {
        if (status.isInBlock) {
            this.alert.info("Transaction is in block", {style: this.alertStyle})
        } else if (status.isFinalized) {
            continueWith();
        }
    }

    private async contractMessage(payload: AnyJson, inputValue: number, gasLimit: number): promiseXt {
        const message = {
            destination: this.source,
            payload,
            gasLimit: BigInt(gasLimit),
            value: inputValue
        }

        if (this.validateAccount()) {
            return this.api.message.send(message, this.metadata)
        }

        return null;
    }

    private validateAccount(): boolean {
        const localAccount = this.account;
        return this.accounts.some(
            (visibleAccount: Account) => visibleAccount.address === localAccount?.address
        )
    }

}