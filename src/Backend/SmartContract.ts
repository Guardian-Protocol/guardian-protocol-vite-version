import {GearApi, GearKeyring, ProgramMetadata} from "@gear-js/api";
import {Account, AlertContainerFactory} from "@gear-js/react-hooks";
import {SubmittableExtrinsic} from "@polkadot/api/promise/types";
import {web3FromSource} from "@polkadot/extension-dapp";
import {AnyJson, ISubmittableResult} from "@polkadot/types/types";

type address = `0x${string}`
type promiseXt = Promise<SubmittableExtrinsic | null>

export class SmartContract {
    private api: GearApi;

    // noinspection TypeScriptFieldCanBeMadeReadonly
    private account: Account | null;
    private accounts: any;

    private alert: AlertContainerFactory;
    private readonly admin: address;
    private readonly stash: address;

    private readonly source: address;
    private readonly metadata: ProgramMetadata;

    private readonly ftSource: address;
    private readonly ftMetadata: ProgramMetadata;

    private readonly storeMetadata: ProgramMetadata;

    private readonly alertStyle = {
        width: "30%",
        height: "5%",
        margin: "20px",
        backgroundColor: "rgba(213,145,0,0.95)"
    }

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

        const { seed } = GearKeyring.generateSeed(import.meta.env.VITE_ADMIN_NMONIC as address)
        this.admin = seed

        this.stash = import.meta.env.VITE_STASH_ADDRESS as address;

        this.source = import.meta.env.VITE_CONTRACT_ADDRESS as address;
        this.metadata = ProgramMetadata.from(import.meta.env.VITE_CONTRACT_METADATA as address);

        this.ftSource = import.meta.env.VITE_FT_CONTRACT_ADDRESS as address;
        this.ftMetadata = ProgramMetadata.from(import.meta.env.VITE_FT_CONTRACT_METADATA as address);

        this.storeMetadata = ProgramMetadata.from(import.meta.env.VITE_STORE_METADATA as address)
    }

    public async stake(payload: AnyJson, value: number, gasLimit: number) {
        const stakeMessage = await this.contractMessage(payload, value, gasLimit);

        await this.signer(stakeMessage!, async () => {
            const stakeTX = this.api.tx.staking.bondExtra(value * 1000000000000)
            const proxyTX = this.api.tx.proxy.proxy(this.stash, null, stakeTX);
            await this.proxySigner(proxyTX, () => {
                this.alert.success("SUCCESSFUL TRANSACTION", {style: this.alertStyle})
            })
        });
    }

    public async unstake(payload: AnyJson, value: number, amount: number) {
        const approveMessage = await this.approveTokensMessage(amount, 0.6 * 1000000000000)
        const unstakeMessage = await this.contractMessage(payload, value, 0.6 * 1000000000000);

        await this.signer(approveMessage!, async () => {
            await this.signer(unstakeMessage!, async () => {
                const unboundTX = this.api.tx.staking.unbond(amount * 1000000000000);
                const proxyTX = this.api.tx.proxy.proxy(this.stash, null, unboundTX);
                await this.proxySigner(proxyTX, () => {
                    this.alert.success("SUCCESSFUL TRANSACTION", {style: this.alertStyle})
                })
            });
        });
    }

    public async withdraw(unestakeId: number, liberationEra: number, amount: number) {
        const currentEra = await this.getCurrentEra();

        const payload =  {
            Withdraw: [
                unestakeId,
                currentEra
            ]
        }

        const withdrawMessage = await this.contractMessage(payload, 0, 0.06 * 1000000000000)

        await this.signer(withdrawMessage!, async () => {
            if (currentEra >= liberationEra) {
                const withdrawTX = this.api.tx.staking.withdrawUnbonded(0);
                const proxyTX = this.api.tx.proxy.proxy(this.stash, null, withdrawTX);
                await this.proxySigner(proxyTX, async () => {
                    const transferMessage = this.api.tx.balances.transferKeepAlive(this.account?.decodedAddress!, amount * 1000000000000);
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
        const result = (await this.getState({ GetTransactionHistory: this.account?.decodedAddress }));
        return result === 0 ? 0 : result.transactionHistory;
    }

    public async getUnstakeHistory() {
        const result = (await this.getState({ GetUnestakeHistory: this.account?.decodedAddress }));
        return result === 0 ? 0 : result.unestakeHistory;
    }

    public async getLockedBalance() {
        const result = (await this.getState({ GetUserVaraLocked: this.account?.decodedAddress }));
        return result === 0 ? 0 : result.userVaraLocked;
    }

    public async getCurrentEra(): Promise<number> {
        const option =  (await this.api?.query.staking.currentEra());
        return option.unwrap().toNumber();
    }

    public async balanceOf() {
        const result = await this.getFTState();
        return result.toNumber()
    }

    private async getState(payload: AnyJson = {}) {
        const store = await this.api?.programState.read({
            programId: this.source,
            payload: {
                GetUserStore: this.account?.decodedAddress,
            },
        }, this.metadata);

        if ((store as any).isErr) {
            return 0;
        }

        const state = await this.api?.programState.read({
            programId: (store as any).toJSON().ok.userStore,
            payload,
        }, this.storeMetadata);

        if ((state as any).isErr) {
            this.alert.error((state as any).asErr.asUserNotFound, {style: this.alertStyle});
            return 0;
        }

        return (state as any).toJSON().ok;
    }


    private async getFTState(): Promise<any> {
        try {
            const state = await this.api?.programState.read({
                programId: this.ftSource,
                payload: {
                    BalanceOf: this.account?.decodedAddress
                }
            }, this.ftMetadata)

            return (state as any).asBalance
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
            value: inputValue * 1000000000000
        }

        if (this.validateAccount()) {
            return this.api.message.send(message, this.metadata)
        }

        return null;
    }

    private async approveTokensMessage(value: number, gasLimit: number): promiseXt {
        const message = {
            destination: this.ftSource,
            payload: {
                Approve: {
                    tx_id: null,
                    to: this.source,
                    amount: value
                }
            },
            gasLimit: BigInt(gasLimit),
            value: 0
        }

        if (this.validateAccount()) {
            return this.api.message.send(message, this.ftMetadata);
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