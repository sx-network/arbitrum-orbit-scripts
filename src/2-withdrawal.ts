import { utils, providers, Wallet } from "ethers";
import { Provider } from "@ethersproject/abstract-provider";
import {
  Erc20Bridger,
  EthBridger,
  L1ToL2MessageStatus,
  EthDepositStatus,
  addCustomNetwork,
  L2Network,
  addDefaultLocalNetwork,
  L2TransactionReceipt,
  L2ToL1MessageStatus,
} from "@arbitrum/sdk";
//import { arbLog, requireEnvVariables } from "arb-shared-dependencies";
import dotenv from "dotenv";
dotenv.config();
//requireEnvVariables(["DEVNET_PRIVKEY", "L1RPC", "L2RPC", "TOKEN_ADDRESS"]);

console.log("Environment Variables Loaded");

/**
 * Set up: instantiate L1 / L2 wallets connected to providers
 */
const walletPrivateKey: string = process.env.DEVNET_PRIVKEY as string;

const l1Provider = new providers.JsonRpcProvider(process.env.L1RPC);
const l2Provider = new providers.JsonRpcProvider(process.env.L2RPC);
const l1Wallet = new Wallet(walletPrivateKey, l1Provider);
const l2Wallet = new Wallet(walletPrivateKey, l2Provider);
// const l2Wallet = new Wallet(walletPrivateKey, l2Provider);

const main = async () => {
  // await arbLog("Deposit token using Arbitrum SDK");

  const l2Network: L2Network = {
    chainID: 88153591557,
    confirmPeriodBlocks: 20,
    ethBridge: {
      inbox: "0x438d3Fb3B49C4aB9FD01791B5f297A0a415f66C0",
      bridge: "0x3986D14164B3B6EcADAb9376Efe4E905a2a32d68",
      outbox: "0x78be110441359d69cffeEa1941259C8A5292D886",
      rollup: "0x78Caf4A899A3949C6109d17a76fD5A2DB29dA2f5",
      sequencerInbox: "0xa41c89A543dF14B4d5C06dD1e7B94AEd01542E95",
    },
    tokenBridge: {
      l1CustomGateway: "",
      l1ERC20Gateway: "",
      l1GatewayRouter: "",
      l1MultiCall: "",
      l1ProxyAdmin: "",
      l1Weth: "",
      l1WethGateway: "",
      l2CustomGateway: "",
      l2ERC20Gateway: "",
      l2GatewayRouter: "",
      l2Multicall: "",
      l2ProxyAdmin: "",
      l2Weth: "",
      l2WethGateway: "",
    },
    partnerChainID: 421614,
    isArbitrum: true,
    blockTime: 0.25,
    partnerChainIDs: [],
    explorerUrl: "https://arb-blueberry.gelatoscout.com/",
    isCustom: true,
    name: "Blueberry",
    retryableLifetimeSeconds: 7 * 24 * 60 * 60,
    nitroGenesisBlock: 0,
    nitroGenesisL1Block: 0,
    depositTimeout: 900000,
    nativeToken: "0xf5055e7C5Ea7b941E4ebad2F028Cb29962a3168C",
  };
  // register - needed for retryables
  addCustomNetwork({
    customL2Network: l2Network,
  });


  let txnHash= "0xcc4b67573a8fd6bd8e467a315a3486e603f98dec959318f0129aa8b7d82726aa";

  const receipt = await l2Provider.getTransactionReceipt(txnHash)



  const l2Receipt = new L2TransactionReceipt(receipt)


  const messages = await l2Receipt.getL2ToL1Messages(l1Wallet)
  const l2ToL1Msg = messages[0]

  if ((await l2ToL1Msg.status(l2Provider)) == L2ToL1MessageStatus.EXECUTED) {
    console.log(`Message already executed! Nothing else to do here`)
    process.exit(1)
  }

 //console.log(await l2ToL1Msg.status(hre.ethers.provider))
 const timeToWaitMs = 1000 * 60
 console.log(
   "Waiting for the outbox entry to be created. This only happens when the L2 block is confirmed on L1, ~1 week after it's creation."
 )
 await l2ToL1Msg.waitUntilReadyToExecute(l2Provider, timeToWaitMs)
 console.log('Outbox entry exists! Trying to execute now')
 const res = await l2ToL1Msg.execute(l2Provider)

  const rec = await res.wait()
  console.log('Done! Your transaction is executed', rec)

};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
