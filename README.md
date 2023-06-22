# wagmi-connector

## Installation

```shell
  npm install @unipasswallet/wagmi-connector
```
or
```shell
  yarn add @unipasswallet/wagmi-connector
```
or
```shell
  pnpm add @unipasswallet/wagmi-connector
```
## Parameters

* `chains` -- Chains supported by app. This is the same parameter as would be passed to other RainbowKit wallets..

* `options.connect` -- Connection options for the default networkId, name of the app.

* `options.connect.chainId` -- Default chainId.

* `options.connect.returnEmail` -- If true, email will return when connect function been called.

* `options.connect.appSettings` -- Config appName, appIcon and theme.

## Usage

```js
  import { UniPassConnector } from "@unipasswallet/wagmi-connector'

  const unipass = new UniPassConnector({
    options: {
      connect: {
        chainId: 80001,
        returnEmail: false,
        appSettings: {
          appName: "wagmi demo",
          appIcon: "your icon url",
          theme: UniPassTheme.dark,w
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

## Example

A demo app for Wagmi is available [here](https://up-wagmi-demo.vercel.app/)
