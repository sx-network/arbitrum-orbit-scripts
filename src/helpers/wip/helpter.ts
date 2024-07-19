import { L1ToL2MessageGasEstimator } from "@arbitrum/sdk";
import { L1ToL2MessageGasParams } from "@arbitrum/sdk/dist/lib/message/L1ToL2MessageCreator";
import { Provider } from "@ethersproject/abstract-provider";
import { BigNumber, Contract } from "ethers";
import { getAddress } from "ethers/lib/utils";

export const getL1ToL2GasParams = async ({
    account,
    amount,
    l1Provider,
    l2Provider,
    token,
  }: {
    account: string;
    amount: BigNumber;
    l1Provider: Provider;
    l2Provider: Provider;
    token: string;
  }): Promise<L1ToL2MessageGasParams> => {
  
    let abi = ["function getOutboundCalldata(address _token,address _from,address _to,uint256 _amount,bytes memory _data) public view returns (bytes memory outboundCalldata)"]
    let gatewayContract = new Contract("0x01E1bE90c617b076978b37aCA9552877a15a7006",abi,l1Provider)

    const outboundCalldata = await gatewayContract.getOutboundCalldata(token, account, account, amount, '0x');
    console.log(outboundCalldata)


    const l1ToL2MessageGasEstimate = new L1ToL2MessageGasEstimator(l2Provider);
    let baseFee =  await getBaseFee(l1Provider);
    console.log(30,baseFee.toString())
    return l1ToL2MessageGasEstimate.estimateAll(
      {
        from: account,
        to: account,
        l2CallValue: BigNumber.from(0),
        excessFeeRefundAddress: account,
        callValueRefundAddress: account,
        data: outboundCalldata,
      },
      await getBaseFee(l1Provider),
      l1Provider,
    );
  };

  export const getBaseFee = async (provider: Provider): Promise<BigNumber> => {
    const baseFee = (await provider.getBlock('latest')).baseFeePerGas
    if (!baseFee) {
      throw new Error(
        'Latest block did not contain base fee, ensure provider is connected to a network that supports EIP 1559.'
      )
    }
    return baseFee
  }