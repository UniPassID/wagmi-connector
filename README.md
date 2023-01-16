# wagmi-connector

Wagmi connector for the [UniPass](https://unipass.vip/) wallet.

## Install

```shell
  npm install @unipasswallet/wagmi-connector @unipasswallet/ethereum-provider
```
or
```shell
  yarn add @unipasswallet/wagmi-connector @unipasswallet/ethereum-provider
```
```


## Params

* `chains` -- Chains supported by app.

* `options.connect` -- Connection options for the default networkId, name of the app, etc...


## Example of usage

```js
  import { UniPassConnector } from "@unipasswallet/wagmi-connector'

  const unipass = new UniPassConnector({
    options: {
      connect: {
        chainId: 80001,
        returnEmail: false,
        appSettings: {
          appName: "wagmi demo",
        },
      },
    },
  });

  const connectors = [
    unipass,
    new MetaMaskConnector({
      chains,
    }),
  ];
  
  const wagmiClient = createClient({
    autoConnect: false,
    connectors,
    provider,
  });
```
