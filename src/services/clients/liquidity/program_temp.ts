import { GearApi, decodeAddress } from '@gear-js/api';
import { TypeRegistry } from '@polkadot/types';
import { TransactionBuilder, ActorId, ZERO_ADDRESS } from 'sails-js';

export class Program {
  public readonly registry: TypeRegistry;
  public readonly liquidity: Liquidity;

  constructor(public api: GearApi, public programId?: `0x${string}`) {
    const types: Record<string, any> = {
      LiquidityEvent: {"_enum":{"Staked":"u128","Unstaked":"u128","Withdrawn":"u128","NewTokenValue":"u128","AdminAdded":"Null"}},
      LiquidError: {"_enum":["NotEnoughBalance","UnstakeNotFound","WithdrawNotFound","WithdrawIsNotReady","ZeroAmount","ZeroEra","ZeroId","ZeroAddress","NotAdmin","AdminAlreadyExists","FTContractError","StoreError"]},
      Transaction: {"id":"u128","t_type":"String","amount":"U256","date":"String"},
      Unstake: {"id":"u128","amount":"U256","reward":"U256","liberation_era":"u128","token_value_at":"U256"},
    }

    this.registry = new TypeRegistry();
    this.registry.setKnownTypes({ types });
    this.registry.register(types);

    this.liquidity = new Liquidity(this);
  }

  newCtorFromCode(code: Uint8Array | Buffer, gvara_program_id: ActorId): TransactionBuilder<null> {
    const builder = new TransactionBuilder<null>(
      this.api,
      this.registry,
      'upload_program',
      ['New', gvara_program_id],
      '(String, [u8;32])',
      'String',
      code,
    );

    this.programId = builder.programId;
    return builder;
  }

  newCtorFromCodeId(codeId: `0x${string}`, gvara_program_id: ActorId) {
    const builder = new TransactionBuilder<null>(
      this.api,
      this.registry,
      'create_program',
      ['New', gvara_program_id],
      '(String, [u8;32])',
      'String',
      codeId,
    );

    this.programId = builder.programId;
    return builder;
  }
}

export class Liquidity {
  constructor(private _program: Program) {}

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

  public stake(amount: number | string | bigint, gvara_amount: number | string | bigint, user: ActorId, date: string): TransactionBuilder<{ ok: LiquidityEvent } | { err: LiquidError }> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<{ ok: LiquidityEvent } | { err: LiquidError }>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Liquidity', 'Stake', amount, gvara_amount, user, date],
      '(String, String, U256, U256, [u8;32], String)',
      'Result<LiquidityEvent, LiquidError>',
      this._program.programId
    );
  }

  public unstake(amount: number | string | bigint, reward: number | string | bigint, user: ActorId, date: string, liberation_era: number | string | bigint): TransactionBuilder<{ ok: LiquidityEvent } | { err: LiquidError }> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<{ ok: LiquidityEvent } | { err: LiquidError }>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Liquidity', 'Unstake', amount, reward, user, date, liberation_era],
      '(String, String, U256, U256, [u8;32], String, u128)',
      'Result<LiquidityEvent, LiquidError>',
      this._program.programId
    );
  }

  public withdraw(user: ActorId, id: number | string | bigint, actual_era: number | string | bigint): TransactionBuilder<{ ok: LiquidityEvent } | { err: LiquidError }> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<{ ok: LiquidityEvent } | { err: LiquidError }>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Liquidity', 'Withdraw', user, id, actual_era],
      '(String, String, [u8;32], u128, u128)',
      'Result<LiquidityEvent, LiquidError>',
      this._program.programId
    );
  }

  public async tokenHoldersAddress(originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<Array<ActorId>> {
    const payload = this._program.registry.createType('(String, String)', ['Liquidity', 'TokenHoldersAddress']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId!,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || undefined,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, Vec<[u8;32]>)', reply.payload);
    return result[2].toJSON() as unknown as Array<ActorId>;
  }

  public async tokenValue(originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<bigint> {
    const payload = this._program.registry.createType('(String, String)', ['Liquidity', 'TokenValue']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId!,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || undefined,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, u128)', reply.payload);
    return result[2].toBigInt() as unknown as bigint;
  }

  public async totalSupply(originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<bigint> {
    const payload = this._program.registry.createType('(String, String)', ['Liquidity', 'TotalSupply']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId!,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || undefined,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, u128)', reply.payload);
    return result[2].toBigInt() as unknown as bigint;
  }

  public async transactionsOf(user: ActorId, originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<Array<Transaction>> {
    const payload = this._program.registry.createType('(String, String, [u8;32])', ['Liquidity', 'TransactionsOf', user]).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId!,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || undefined,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, Vec<Transaction>)', reply.payload);
    return result[2].toJSON() as unknown as Array<Transaction>;
  }

  public async unstakesOf(user: ActorId, originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<Array<Unstake>> {
    const payload = this._program.registry.createType('(String, String, [u8;32])', ['Liquidity', 'UnstakesOf', user]).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId!,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || undefined,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, Vec<Unstake>)', reply.payload);
    return result[2].toJSON() as unknown as Array<Unstake>;
  }
}