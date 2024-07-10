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
} from "@arbitrum/sdk";
import { arbLog, requireEnvVariables } from "arb-shared-dependencies";
import dotenv from "dotenv";
dotenv.config();
requireEnvVariables(["DEVNET_PRIVKEY", "L1RPC", "L2RPC", "TOKEN_ADDRESS"]);

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

  // Add the default local network configuration to the SDK
  addDefaultLocalNetwork();

  const ethToL2DepositAmount = utils.parseEther("0.0001");

  // Set up the Erc20Bridger
  const ethBridger = new EthBridger(l2Network);

  console.log("Eth Bridger Set Up");
  //   console.log(ethBridger);

  const l2WalletInitialEthBalance = await l2Wallet.getBalance();
  const result = utils.formatEther(l2WalletInitialEthBalance);

  console.log(`your L2 ETH balance is ${result.toString()}`);

  const depositTx = await ethBridger.deposit({
    amount: ethToL2DepositAmount,
    l1Signer: l1Wallet,
  });

  const depositRec = await depositTx.wait();
  console.warn("deposit L1 receipt is:", depositRec.transactionHash);

  /**
   * With the transaction confirmed on L1, we now wait for the L2 side (i.e., balance credited to L2) to be confirmed as well.
   * Here we're waiting for the Sequencer to include the L2 message in its off-chain queue. The Sequencer should include it in under 10 minutes.
   */
  console.warn("Now we wait for L2 side of the transaction to be executed ⏳");
  const l2Result = await depositRec.waitForL2(l2Provider);
  /**
   * The `complete` boolean tells us if the l1 to l2 message was successful
   */
  l2Result.complete
    ? console.log(
        `L2 message successful: status: ${
          EthDepositStatus[await l2Result.message.status()]
        }`
      )
    : console.log(
        `L2 message failed: status ${
          EthDepositStatus[await l2Result.message.status()]
        }`
      );

  /**
   * Our l2Wallet ETH balance should be updated now
   */
  const l2WalletUpdatedEthBalance = await l2Wallet.getBalance();
  console.log(
    `your L2 ETH balance is updated from ${l2WalletInitialEthBalance.toString()} to ${l2WalletUpdatedEthBalance.toString()}`
  );
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
