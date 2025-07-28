import { GearApi, Program, HexString, decodeAddress } from '@gear-js/api';
import { TypeRegistry } from '@polkadot/types';
import { TransactionBuilder, ActorId, throwOnErrorReply, getServiceNamePrefix, getFnNamePrefix, ZERO_ADDRESS } from 'sails-js';

export class SailsProgram {
  public readonly registry: TypeRegistry;
  public readonly liquidity: Liquidity;
  public readonly session: Session;
  private _program: Program | undefined;

  constructor(public api: GearApi, programId?: `0x${string}`, _program?: Program) {
    const types: Record<string, any> = {
      Config: {"gas_to_delete_session":"u64","minimum_session_duration_ms":"u64","ms_per_block":"u64"},
      LiquidityEvent: {"_enum":{"Staked":"u128","Unstaked":"u128","Withdrawn":"u128","NewTokenValue":"u128","AdminAdded":"Null","AdminRemoved":"Null"}},
      LiquidError: {"_enum":{"NotEnoughBalance":"Null","UnstakeNotFound":"Null","WithdrawNotFound":"Null","WithdrawIsNotReady":"Null","ZeroAmount":"Null","ZeroEra":"Null","ZeroId":"Null","ZeroAddress":"Null","NotAdmin":"Null","AdminAlreadyExists":"Null","FTContractError":"Null","StoreError":"Null","CantRemoveSelf":"Null","AdminNotFound":"Null","LastAdmin":"Null","StakingError":"StakingError"}},
      StakingError: {"_enum":{"ContractEraIsNotSynchronized":"Null","ActionOnlyForAdmins":"Null","ValueIsZero":"Null","ValueLessThanOne":"Null","ErrorInFirstStageMessage":"String","ErrorInUpstreamProgram":"Null","ReplyError":{"payload":"String","reason":"String"},"TokensReadyToWithdraw":"Null","TokensAlreadyWithdrawn":"Null","TokensAlreadyRebonded":"Null","UnbondIdDoesNotExists":"Null","BondIdOverflow":"Null","UnbondIdAlreadyWithdrawn":"u64","UnbondIdWasRebonded":"u64","UnbondIdOverflow":"Null","UnbondIdCanNotBeWithdraw":{"can_withdraw_at_block":"u64","current_block":"u64"},"RebondIdOverflow":"Null","UserBondOverflow":"Null","UserBondUnderflow":"Null","UserUnbondOverflow":"Null","UserUnbondUnderflow":"Null","UserInsufficientBond":"Null","UserHasNoBonds":"Null","UserHasNoUnbonds":"Null","NominateAtLeastOneAddress":"Null","NominationsAmountError":{"max":"u8","received":"u32"}}},
      Transaction: {"id":"u128","t_type":"String","amount":"U256","date":"String"},
      Unstake: {"id":"u128","amount":"U256","reward":"U256","liberation_era":"u128","token_value_at":"U256"},
      SignatureData: {"key":"[u8;32]","duration":"u64","allowed_actions":"Vec<ActionsForSession>"},
      ActionsForSession: {"_enum":["Stake","Unstake","Withdraw"]},
      SessionData: {"key":"[u8;32]","expires":"u64","allowed_actions":"Vec<ActionsForSession>","expires_at_block":"u32"},
    }

    this.registry = new TypeRegistry();
    this.registry.setKnownTypes({ types });
    this.registry.register(types);
    if (programId) {
      this._program = new Program(programId, api);
    }

    this.liquidity = new Liquidity(this);
    this.session = new Session(this);
  }

  public get programId(): `0x${string}` {
    if (!this._program) throw new Error(`Program ID is not set`);
    return this._program.id;
  }

  newCtorFromCode(code: Uint8Array | Buffer | HexString, session_config: Config, gvara_program_id: ActorId, on_mainnet: boolean): TransactionBuilder<null> {
    const builder = new TransactionBuilder<null>(
      this.api,
      this.registry,
      'upload_program',
      ['New', session_config, gvara_program_id, on_mainnet],
      '(String, Config, [u8;32], bool)',
      'String',
      code,
      async (programId) =>  {
        this._program = await Program.new(programId, this.api);
      }
    );
    return builder;
  }

  newCtorFromCodeId(codeId: `0x${string}`, session_config: Config, gvara_program_id: ActorId, on_mainnet: boolean) {
    const builder = new TransactionBuilder<null>(
      this.api,
      this.registry,
      'create_program',
      ['New', session_config, gvara_program_id, on_mainnet],
      '(String, Config, [u8;32], bool)',
      'String',
      codeId,
      async (programId) =>  {
        this._program = await Program.new(programId, this.api);
      }
    );
    return builder;
  }
}

export class Liquidity {
  constructor(private _program: SailsProgram) {}

  public addAdmin(admin: ActorId): TransactionBuilder<{ ok: LiquidityEvent } | { err: LiquidError }> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<{ ok: LiquidityEvent } | { err: LiquidError }>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Liquidity', 'AddAdmin', admin],
      '(String, String, [u8;32])',
      'Result<LiquidityEvent, LiquidError>',
      this._program.programId
    );
  }

  public removeAdmin(admin: ActorId): TransactionBuilder<{ ok: LiquidityEvent } | { err: LiquidError }> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<{ ok: LiquidityEvent } | { err: LiquidError }>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Liquidity', 'RemoveAdmin', admin],
      '(String, String, [u8;32])',
      'Result<LiquidityEvent, LiquidError>',
      this._program.programId
    );
  }

  public setTokenValue(value: number | string | bigint): TransactionBuilder<{ ok: LiquidityEvent } | { err: LiquidError }> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<{ ok: LiquidityEvent } | { err: LiquidError }>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Liquidity', 'SetTokenValue', value],
      '(String, String, U256)',
      'Result<LiquidityEvent, LiquidError>',
      this._program.programId
    );
  }

  public stake(session_for_account: ActorId | null): TransactionBuilder<{ ok: LiquidityEvent } | { err: LiquidError }> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<{ ok: LiquidityEvent } | { err: LiquidError }>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Liquidity', 'Stake', session_for_account],
      '(String, String, Option<[u8;32]>)',
      'Result<LiquidityEvent, LiquidError>',
      this._program.programId
    );
  }

  public unstake(amount: number | string | bigint, session_for_account: ActorId | null): TransactionBuilder<{ ok: LiquidityEvent } | { err: LiquidError }> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<{ ok: LiquidityEvent } | { err: LiquidError }>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Liquidity', 'Unstake', amount, session_for_account],
      '(String, String, U256, Option<[u8;32]>)',
      'Result<LiquidityEvent, LiquidError>',
      this._program.programId
    );
  }

  public withdraw(unstake_id: number | string | bigint, session_for_account: ActorId | null): TransactionBuilder<{ ok: LiquidityEvent } | { err: LiquidError }> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<{ ok: LiquidityEvent } | { err: LiquidError }>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Liquidity', 'Withdraw', unstake_id, session_for_account],
      '(String, String, u128, Option<[u8;32]>)',
      'Result<LiquidityEvent, LiquidError>',
      this._program.programId
    );
  }

  public async tokenHoldersAddress(originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<Array<ActorId>> {
    const payload = this._program.registry.createType('(String, String)', ['Liquidity', 'TokenHoldersAddress']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    throwOnErrorReply(reply.code, reply.payload.toU8a(), this._program.api.specVersion, this._program.registry);
    const result = this._program.registry.createType('(String, String, Vec<[u8;32]>)', reply.payload);
    return result[2].toJSON() as unknown as Array<ActorId>;
  }

  public async tokenValue(originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<bigint> {
    const payload = this._program.registry.createType('(String, String)', ['Liquidity', 'TokenValue']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    throwOnErrorReply(reply.code, reply.payload.toU8a(), this._program.api.specVersion, this._program.registry);
    const result = this._program.registry.createType('(String, String, u128)', reply.payload);
    return result[2].toBigInt() as unknown as bigint;
  }

  public async totalSupply(originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<bigint> {
    const payload = this._program.registry.createType('(String, String)', ['Liquidity', 'TotalSupply']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    throwOnErrorReply(reply.code, reply.payload.toU8a(), this._program.api.specVersion, this._program.registry);
    const result = this._program.registry.createType('(String, String, u128)', reply.payload);
    return result[2].toBigInt() as unknown as bigint;
  }

  public async transactionsOf(user: ActorId, originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<Array<Transaction>> {
    const payload = this._program.registry.createType('(String, String, [u8;32])', ['Liquidity', 'TransactionsOf', user]).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    throwOnErrorReply(reply.code, reply.payload.toU8a(), this._program.api.specVersion, this._program.registry);
    const result = this._program.registry.createType('(String, String, Vec<Transaction>)', reply.payload);
    return result[2].toJSON() as unknown as Array<Transaction>;
  }

  public async unstakesOf(user: ActorId, originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<Array<Unstake>> {
    const payload = this._program.registry.createType('(String, String, [u8;32])', ['Liquidity', 'UnstakesOf', user]).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    throwOnErrorReply(reply.code, reply.payload.toU8a(), this._program.api.specVersion, this._program.registry);
    const result = this._program.registry.createType('(String, String, Vec<Unstake>)', reply.payload);
    return result[2].toJSON() as unknown as Array<Unstake>;
  }
}

export class Session {
  constructor(private _program: SailsProgram) {}

  public createSession(signature_data: SignatureData, signature: `0x${string}` | null): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Session', 'CreateSession', signature_data, signature],
      '(String, String, SignatureData, Option<Vec<u8>>)',
      'Null',
      this._program.programId
    );
  }

  public deleteSessionFromAccount(): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Session', 'DeleteSessionFromAccount'],
      '(String, String)',
      'Null',
      this._program.programId
    );
  }

  public deleteSessionFromProgram(session_for_account: ActorId): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Session', 'DeleteSessionFromProgram', session_for_account],
      '(String, String, [u8;32])',
      'Null',
      this._program.programId
    );
  }

  public async sessionForTheAccount(account: ActorId, originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<SessionData | null> {
    const payload = this._program.registry.createType('(String, String, [u8;32])', ['Session', 'SessionForTheAccount', account]).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    throwOnErrorReply(reply.code, reply.payload.toU8a(), this._program.api.specVersion, this._program.registry);
    const result = this._program.registry.createType('(String, String, Option<SessionData>)', reply.payload);
    return result[2].toJSON() as unknown as SessionData | null;
  }

  public async sessions(originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<Array<[ActorId, SessionData]>> {
    const payload = this._program.registry.createType('(String, String)', ['Session', 'Sessions']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    throwOnErrorReply(reply.code, reply.payload.toU8a(), this._program.api.specVersion, this._program.registry);
    const result = this._program.registry.createType('(String, String, Vec<([u8;32], SessionData)>)', reply.payload);
    return result[2].toJSON() as unknown as Array<[ActorId, SessionData]>;
  }

  public subscribeToSessionCreatedEvent(callback: (data: null) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Session' && getFnNamePrefix(payload) === 'SessionCreated') {
        callback(null);
      }
    });
  }

  public subscribeToSessionDeletedEvent(callback: (data: null) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Session' && getFnNamePrefix(payload) === 'SessionDeleted') {
        callback(null);
      }
    });
  }
}