import { createPublicClient, formatEther, Hex, http } from 'viem'
import { mainnet, sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import dotenv from 'dotenv'
dotenv.config()

const privateKey = "0x24368f55318941551be65179e21937e70345050dc5742ac99844eca6b607958b"
// const privateKey = process.env.ACCOUNT_FOR_DEV_PRIVATE_KEY
const account = privateKeyToAccount(privateKey as Hex)
// console.log(account);

;
(async () => {
    const client = createPublicClient({
        chain: sepolia,
        transport: http(process.env.SEPOLIA_RPC_URL),
    })
    const banlance = await client.getBalance({
        address: account.address,
    })
    console.log(formatEther(banlance));
    const num = await client.getTransactionCount({
        address: process.env.MAIN_ACCOUNT_PUB_KEY as Hex,
    })
    console.log('transaction count:', num);
})();
