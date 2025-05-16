import { createPublicClient, createWalletClient, formatEther, getContract, Hex, http, publicActions, parseAbiItem } from 'viem'
import { mainnet, sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import nftMarket from '../../artifacts/NFTMarket.json'
import dotenv from 'dotenv'
import { create } from 'domain'
import axios, { head } from 'axios';
import { useAccount } from 'wagmi'
import TransferList from './TransferList';

// dotenv.config()

// const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL;

// const privateKey = process.env.ACCOUNT_FOR_DEV_PRIVATE_KEY
// const account = privateKeyToAccount(privateKey as Hex)



export default function GetLogs() {
    const { address } = useAccount();

    // const address = "0x4251BA8F521CE6bAe071b48FC4621baF621057c5";
    async function getLogs() {
        const publicClient = createPublicClient({
            chain: sepolia,
            transport: http(),
        });
        // client.getLogs({
        //     address: '0x01f02c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0})
        // }
        const curBlock = await publicClient.getBlockNumber();
        console.log('当前块高:', curBlock);
        const logs = await publicClient.getLogs({
            address: '0x56b9D2Cf44789D9626593A3CD3b75BFf9E6a64a0',
            event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
            args: {
                // from: address as Hex,
                // from: '0x4251BA8F521CE6bAe071b48FC4621baF621057c5',
                // to: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'
            },
            // fromBlock: 16330000n,
            // toBlock: 16330050n
            fromBlock: curBlock - 9000n,
            toBlock: curBlock,
        });
        // console.log(logs);
        // 使用 replacer 函数将 bigint 转换为字符串
        const json_str = JSON.stringify(logs, (key, value) => {
            if (typeof value === 'bigint') {
                return value.toString(); // 将 bigint 转为字符串
            }
            return value;
        });
        console.log(json_str);

        // 存储事件
        // const response = await axios.post('http://localhost:8080/api/events', json_str);
        const response = await axios.post(
            'http://localhost:8080/api/events',
            json_str,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log('Transfer created:', response.data);
    }
    return (
        <div>
            <button onClick={getLogs}>getLogs</button>
            {address && <TransferList fromAddress={address} />}
        </div>
    );
}



