# Arbitrum Orbit Deposit and Withdrawal Scripts on SX testnet

## Introduction

This repository contains scripts for performing deposit and withdrawal operations using the Arbitrum SDK. The scripts allow you to deposit the SX native token as well as USDC from Sepolia to SX-testnet and withdraw it back to L1, demonstrating the interoperability between Ethereum and Arbitrum networks.

## Setup

Before running the scripts, ensure you have the necessary dependencies installed and the environment variables configured.

### Prerequisites

- Node.js
- Environment Variable:
  - `DEVNET_PRIVKEY`: Your private key
  - `L1RPC`: L1 RPC URL
  - `L2RPC`: L2 RPC URL

## Scripts for Native token 

Native token here: [https://sepolia.etherscan.io/address/0x9c5eb9723728123af896089b902cb17b44fd09e6](https://sepolia.etherscan.io/address/0x9c5eb9723728123af896089b902cb17b44fd09e6)

### Deposit Native Token

```typescript
yarn native:deposit
```
Please visit the [native-deposit.ts](./src/native-deposit.ts) file to understand the process, worth noticing the requirement to approve the bridger to expend the native token

```typescript
  const approveTx = await ethBridger.approveGasToken({
    l1Signer: l1Wallet
  });
  const approveRec = await approveTx.wait();``

```

### Withdrawal

```typescript
yarn native:withdraw
```

Please visit the [native-withdrawal.ts](./src/native-withdrawal.ts) file to understand the process, the withdraw was successful, once the challenge period (1 week) we will execute `yarn withdraw-execution` with following txhash to dinalize the withdraw on L1

```typescript
  let txnHash= "0x7c73bcd8ce223ea3bb20275e6274c8bd1e88079d8a4af016d871cf824036201d" 
```

## Scripts for ERC20s
In this example we will deposit and withdraw USDC from Sepolia to SX-testnet, USDC on Sepolia here [https://sepolia.etherscan.io/address/0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238](https://sepolia.etherscan.io/address/0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238)

### Deposit USDC

```typescript
yarn erc20:deposit
```
Please visit the [erc20-deposit.ts](./src/erc20-deposit.ts) file to understand the process, worth noticing the requirement to approve the erc20bridger to expend the native token and also to approve the USDC

```typescript
  const approveTxGas = await erc20Bridger.approveToken({
    l1Signer: l1Wallet,
    erc20L1Address: "0x9c5EB9723728123AF896089b902CB17B44Fd09e6",
  });
  const approveRecGas = await approveTxGas.wait();


  const approveTx = await erc20Bridger.approveToken({
    l1Signer: l1Wallet,
    erc20L1Address: l1Erc20Address,
  });
  const approveRec = await approveTx.wait();

```

### Withdrawal USDC

```typescript
yarn erc20:withdraw
```

Please visit the [erc20-withdrawal.ts](./src/erc20-withdrawal.ts) file to understand the process, the withdraw was successful, once the challenge period (1 week) we will execute `yarn withdraw-execution` with following txhash to dinalize the withdraw on L1

```typescript
    txnHash="0xc0372436dcc0e7eb70763f8e5b46cf0dad538a4a4965ddcd924667e32c5362c0"
```