import { createPublicClient, createWalletClient, formatEther, getContract, Hex, http, publicActions } from 'viem'
import { mainnet, sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import myNFT from '../../artifacts/MyNFT.json'
import nftMarket from '../../artifacts/NFTMarket.json'
import Xhaschanged from '../../artifacts/Xchanged.json'
import dotenv from 'dotenv'
dotenv.config()

// process.env.SEPOLIA_RPC_URL
// const sepoliaRpcUrl = import.meta.env.SEPOLIA_RPC_URL;
const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL;

const privateKey = process.env.ACCOUNT_FOR_DEV_PRIVATE_KEY
// const privateKey = import.meta.env.ACCOUNT_FOR_DEV_PRIVATE_KEY
const account = privateKeyToAccount(privateKey as Hex)

// const nft_addr = "0x3425C9B618c0518470a936ee36e90ea78123aC83";
// const nft_abi = myNFT["abi"];

// 0xE5199eF18E697b95Dd4252f76af33936A4973FA0
// const nft_martket_addr = "0xf277848FB8aD614708D686b86d796Ed34DF4FCB5";
const nft_martket_addr = "0xEAD2B7Ad2644beE5456B4daC3e1d0541e0cfBF2a";
const nft_market_abi = nftMarket["abi"];

/*
0x4251BA8F521CE6bAe071b48FC4621baF621057c5
100
bafkreieom6kcat2fhzxdk5i7x42kkxhcmaxuk5czxt2x7qx372s7yehhpm
*/

(async () => {
    // const client = createWalletClient({
    //     account: account,
    //     chain: sepolia,
    //     transport: http(sepoliaRpcUrl),
    // }).extend(publicActions);
    console.log();
    const client = createWalletClient({
        account: account,
        chain: sepolia,
        transport: http(sepoliaRpcUrl),
    });

    const contract_nft_market = getContract({
        address: nft_martket_addr as Hex,
        abi: nft_market_abi,
        client,
    });

    // NFT_Market_Init
    // XHasChange
    const events = await contract_nft_market.getEvents.NftOnList({
        fromBlock: 0n,
        toBlock: 'latest',
    });
    console.log('NftOnList events:', events);

    const nftEvents = await contract_nft_market.getEvents.Transfer_NFT({
        fromBlock: 0n,
        toBlock: 'latest',
    });
    console.log('Transfer_NFT events:', nftEvents);

    const receivedEvents = await contract_nft_market.getEvents.NFT_Received({
        fromBlock: 0n,
        toBlock: 'latest',
    });
    console.log('NFT_Received events:', receivedEvents);


    await contract_nft_market.watchEvent.NftOnList({
        onLogs: (logs) => {
            console.log('NFT上架_logs:', logs);
        },
        onError: (error) => {
            console.error('NftOnList监听事件时出错:', error);
        },
    });

    await contract_nft_market.watchEvent.Transfer_NFT({
        onLogs: (logs) => {
            console.log('NFT购买_logs:', logs);
        },
        onError: (error) => {
            console.error('Transfer_NFT监听事件时出错:', error);
        },
    });
    await contract_nft_market.watchEvent.NFT_Received({
        onLogs: (logs) => {
            console.log('NFT卖出_logs:', logs);
        },
        onError: (error) => {
            console.error('NFT_Received监听事件时出错:', error);
        },
    });

})();

