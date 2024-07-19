import { utils, providers, Wallet } from "ethers";
import { Provider } from "@ethersproject/abstract-provider";
import {
  addCustomNetwork,
  L2Network,
  L2TransactionReceipt,
  L2ToL1MessageStatus,
} from "@arbitrum/sdk";
//import { arbLog, requireEnvVariables } from "arb-shared-dependencies";
import dotenv from "dotenv";
import { l2Network } from "./helpers/custom-network";
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
  // register - needed for retryables
  addCustomNetwork({
    customL2Network: l2Network,
  });


  let txnHash= "0xf13116d18bfec0fb9f44850c652e480b0b97de0a405d5000f9caf2028a7cacc4";

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
 const res = await l2ToL1Msg.execute(l2Provider,{  gasLimit:6000000,
  maxFeePerGas:500000000000,
  maxPriorityFeePerGas:50000000000000})

  const rec = await res.wait()
  console.log('Done! Your transaction is executed', rec)

};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
