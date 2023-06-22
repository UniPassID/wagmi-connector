import type { UniPassProviderOptions } from '@unipasswallet/ethereum-provider';
import { UniPassProvider } from '@unipasswallet/ethereum-provider';
import type { UPAccount } from '@unipasswallet/popup-types';
import { providers } from 'ethers';
import type { Address, Chain, ConnectorData, WalletClient } from 'wagmi';
import { Connector } from 'wagmi';

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
  id = 'unipass';
  name = 'UniPass';
  ready = true;

  options: Options | undefined;
  provider: UniPassProvider;

  upAccount?: UPAccount;

  constructor({ chains, options }: UniPassConnectorOptions) {
    super({ chains, options });
    this.options = options;
    this.provider = new UniPassProvider(options.connect);
  }

  getWalletClient(): Promise<WalletClient> {
    const client = {
      id: 'unipass',
      name: 'UniPass',
      Key: 'unipass',
      chains: this.chains,
      pollingInterval: 4000,
      signMessage: async ({ message }: { message: string }) => {
        const signer = await this.getSigner()
        return signer.signMessage(message)
      },
      signTypedData: async ({ message }: { message: any }) => {
        const signer = await this.getSigner()
        await signer.signTypedData(message)
      },
      sendTransaction: async (tx: any) => {
        /* eslint-disable no-await-in-loop */
        /* eslint-disable no-promise-executor-return */
        const signer = await this.getSigner()
        const txHashERC20 = await signer.sendTransaction(tx)
        const checkTxStatus = async (txHash: string) => {
          let tryTimes = 0
          while (tryTimes++ < 3) {
            const receipt = await signer.getTransactionReceipt(txHash)
            if (receipt) return receipt.status
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
          return false
        }
        await checkTxStatus(txHashERC20)
        return txHashERC20
      },
      getChainId: async (): Promise<number> => {
        return Promise.resolve(this.provider.getChainId());
      },
      switchChain: async (chainId: number): Promise<Chain> => {
        await this.provider?.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        });
        // @ts-ignore-next-line
        this?.emit('change', { chain: { id: chainId, unsupported: false } });
        return { id: chainId } as Chain;
      },
    }
    return Promise.resolve(client) as any
  }

  async connect(): Promise<Required<ConnectorData>> {
    let _account: any;
    try {
      // @ts-ignore-next-line
      this?.emit('message', { type: 'connecting' });
      _account = await this.provider.connect();
    } catch (e) {
      throw e;
    }

    const chianId = this.provider.getChainId();
    this.upAccount = _account
    const address = _account.address as Address;

    return {
      account: address,
      chain: {
        id: chianId,
        unsupported: false,
      },
    };
  }

  async disconnect(): Promise<void> {
    await this.provider.disconnect();
  }

  async getAccount(): Promise<any> {
    return Promise.resolve(this.upAccount?.address || '');
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

  async switchChain(chainId: number): Promise<Chain> {
    await this.provider?.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
    // @ts-ignore-next-line
    this?.emit('change', { chain: { id: chainId, unsupported: false } });
    return { id: chainId } as Chain;
  }

  async isAuthorized(): Promise<boolean> {
    return Promise.resolve(!!sessionStorage.getItem('UP-A'));
  }

  protected onAccountsChanged(accounts: string[]) {
    return { account: accounts[0] };
  }

  protected onChainChanged(chain: number): void {
    this.provider?.events?.emit('chainChanged', chain);
    // @ts-ignore-next-line
    this?.emit('change', { chain: { id: chain, unsupported: true } });
  }

  protected onDisconnect() {
    // @ts-ignore-next-line
    this?.emit('disconnect');
  }
}
