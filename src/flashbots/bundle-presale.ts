import { ethers } from "ethers";
import { Wallet, Contract, JsonRpcProvider } from "ethers";
import { FlashbotsBundleProvider, FlashbotsBundleResolution } from "@flashbots/ethers-provider-bundle";
import * as dotenv from "dotenv";

dotenv.config();

const NFT_ABI = [
  "function enablePresale() external",
  "function presale(uint256 amount) external payable"
];

const CHAIN_ID = 11155111; // Sepolia

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;
const OWNER_KEY = process.env.ACCOUNT_FOR_DEV_PRIVATE_KEY!;
const USER_KEY = process.env.SEPOLIA_TEST0_PRI_KEY!;
const SEPOLIA_RPC = process.env.SEPOLIA_RPC_URL!;


const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
// 0xF4fA5bF2Fea64547C088839c2E458275C9F70b2f
// 0x8c894ae81f92cd278849fdc2d294b3f9b7b4ed9c4f4977d249e39f1e1e8a4a55
// const authSigner = Wallet.createRandom(); // Flashbots auth signer
const authSigner = new Wallet("0x8c894ae81f92cd278849fdc2d294b3f9b7b4ed9c4f4977d249e39f1e1e8a4a55"); // Flashbots auth signer

const owner = new Wallet(OWNER_KEY, provider);
const bundler = new Wallet(USER_KEY, provider);

const contract = new Contract(CONTRACT_ADDRESS, NFT_ABI, provider);

async function main() {
  
    const flashbots = await FlashbotsBundleProvider.create(
        provider,
        authSigner,
        "https://relay-sepolia.flashbots.net",
        CHAIN_ID
    );
  const gasFee = await provider.getFeeData();

  // 使用 interface.encodeFunctionData 替代 populateTransaction
  const enableTxData = contract.interface.encodeFunctionData("enablePresale");
  const presaleTxData = contract.interface.encodeFunctionData("presale", [1]);

  const bundleTransactions = await flashbots.signBundle([
    {
      signer: owner,
      transaction: {
        chainId: CHAIN_ID,
        type: 2,
        to: CONTRACT_ADDRESS,
        data: enableTxData,
        maxFeePerGas: gasFee.maxFeePerGas!,
        maxPriorityFeePerGas: gasFee.maxPriorityFeePerGas!,
        gasLimit: 100_000,
      }
    },
    {
      signer: bundler,
      transaction: {
        chainId: CHAIN_ID,
        type: 2,
        to: CONTRACT_ADDRESS,
        data: presaleTxData,
        value: ethers.parseEther("0.01"),
        maxFeePerGas: gasFee.maxFeePerGas!,
        maxPriorityFeePerGas: gasFee.maxPriorityFeePerGas!,
        gasLimit: 100_000,
      }
    }
  ]);

  const blockNumber = await provider.getBlockNumber();
  const targetBlock = blockNumber + 1; 

  const res = await flashbots.sendRawBundle(bundleTransactions, targetBlock);

  if ("error" in res) {
    console.error("Error submitting bundle:", res.error.message);
    return;
  }

  console.log(
        "sendRawBundle 返回结果: \n" ,
        JSON.stringify(res, null, 2)
  );
  console.log("Bundle sent. Waiting for inclusion in block", targetBlock);

  const waitResponse = await res.wait();

  if (waitResponse === FlashbotsBundleResolution.BundleIncluded) {
    console.log("Bundle was included!");
  } else if (waitResponse === FlashbotsBundleResolution.BlockPassedWithoutInclusion) {
    console.warn("Bundle not included.");
  } else if (waitResponse === FlashbotsBundleResolution.AccountNonceTooHigh) {
    console.error("Account nonce too high.");
  }

  console.log("⏳ Waiting for bundle stats...", waitResponse);

  const bundleHash = res.bundleHash;
  console.log("Bundle hash:", bundleHash);
  

  const stats = await flashbots.getBundleStats(bundleHash, targetBlock);
  console.log("Bundle stats:", stats);

//   await flashbots.getBundleStatsV2(bundleHash, targetBlock);
}

async function getBundleState() {
    const flashbots = await FlashbotsBundleProvider.create(
        provider,
        authSigner,
        "https://relay-sepolia.flashbots.net",
        CHAIN_ID
    );
    // const stats = await flashbots.getBundleStatsV2(
    //     "0xe166f6c7f9d0f9893ef095a7b45cf5339ffba38b02533abfa1998093cb959234",
    //     8467805
    // );
    const stats = await flashbots.getBundleStats(
        "0xe166f6c7f9d0f9893ef095a7b45cf5339ffba38b02533abfa1998093cb959234",
        8467805
    );
    console.log("Bundle stats:", stats);
}

main().catch(console.error);

// getBundleState().catch(console.error);
