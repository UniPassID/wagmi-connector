import {
    UniPassProvider,
    UniPassProviderOptions,
  } from "@unipasswallet/ethereum-provider";
  import { UPAccount } from "@unipasswallet/popup-types";
  import { providers } from "ethers";
  import {
    Address,
    Chain,
    Connector,
    ConnectorData,
    UserRejectedRequestError,
  } from "wagmi";
  
  interface Options {
    connect: UniPassProviderOptions;
  }
  
  interface UniPassConnectorOptions {
    chains?: Chain[];
    options: Options;
  }
  
  export class UniPassConnector extends Connector<
    UniPassProvider,
    Options | undefined
  > {
    id = "unipass";
    name = "UniPass";
    ready = true;
  
    options: Options | undefined;
    provider: UniPassProvider;
    upAccount?: UPAccount;
  
    constructor({ chains, options }: UniPassConnectorOptions) {
      super({ chains, options });
      this.options = options;
      this.provider = new UniPassProvider(options.connect);
    }
  
    async connect(): Promise<Required<ConnectorData<providers.Web3Provider>>> {
      let _account: any;
      if (!this.provider?.isConnected()) {
        try {
          _account = await this.provider.connect();
        } catch (e) {
          throw new UserRejectedRequestError(e);
        }
      }
  
      const chianId = this.provider.getChainId();
      const address = _account.address as Address;
      this.upAccount = _account;
  
      return {
        account: address,
        chain: {
          id: chianId,
          unsupported: false,
        },
        provider: new providers.Web3Provider(this.provider, "any"),
      };
    }
  
    async disconnect(): Promise<void> {
      await this.provider.disconnect();
    }
  
    async getAccount(): Promise<`0x${string}`> {
      return Promise.resolve(this.upAccount?.address as `0x${string}`);
    }
  
    async getChainId(): Promise<number> {
      return Promise.resolve(this.provider.getChainId());
    }
  
    async getProvider(): Promise<UniPassProvider> {
      return Promise.resolve(this.provider);
    }
  
    async getSigner(): Promise<any> {
      const chainId = await this.getChainId();
      const account = await this.getAccount();
      return Promise.resolve(
        new providers.Web3Provider(this.provider, chainId).getSigner(account)
      );
    }
  
    async isAuthorized(): Promise<boolean> {
      return Promise.resolve(this.provider.isConnected());
    }
  
    protected onAccountsChanged(accounts: `0x${string}`[]): void {
      throw new Error("Method not implemented.");
    }
  
    protected onChainChanged(chain: string | number): void {
      throw new Error("Method not implemented.");
    }
  
    protected onDisconnect(error: Error): void {
      throw new Error("Method not implemented.");
    }
  }
  