import { createPublicClient, createWalletClient, formatEther, getContract, Hex, http, publicActions } from 'viem'
import { mainnet, sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import dotenv from 'dotenv'
import tokenBankJson from '@artifacts/TokenBankV2.json'
import baseERC20 from '@artifacts/BaseERC20.json'

const { abi, bytecode } = tokenBankJson
// const {abi, bytecode} = baseERC20

dotenv.config()

// const privateKey = "0x24368f55318941551be65179e21937e70345050dc5742ac99844eca6b607958b"
const privateKey = process.env.ACCOUNT_FOR_DEV_PRIVATE_KEY
const account = privateKeyToAccount(privateKey as Hex)

    // ERC20 transaction 0x7899c12b80739488d0fb96a298314fb9351b55c3a0a399670a2cbd1c5f314157
    // ERC20 合约地址 0x56b9d2cf44789d9626593a3cd3b75bff9e6a64a0

    // Bank transaction 0xab1502b2516e18494e3f6eef34fcfe5844916c5e5a175742db305191581bcc1e
    // Bank 合约地址 0x0d1ac1a9a830904b6b447f82785e67b377ec1ecb
    ;
const erc20_trx = "0x7899c12b80739488d0fb96a298314fb9351b55c3a0a399670a2cbd1c5f314157";
const erc20_address = "0x56b9d2cf44789d9626593a3cd3b75bff9e6a64a0";
const erc20_abi = baseERC20["abi"];

const bank_trx = "0xab1502b2516e18494e3f6eef34fcfe5844916c5e5a175742db305191581bcc1e";
const bank_address = "0x0d1ac1a9a830904b6b447f82785e67b377ec1ecb";
const bank_abi = tokenBankJson["abi"];



(async () => {
    const client = createWalletClient({
        account: account,
        chain: sepolia,
        transport: http(process.env.SEPOLIA_RPC_URL),
    }).extend(publicActions);

    // const erc20Hash = await client.deployContract({
    //     abi: abi,
    //     bytecode: bytecode["object"] as Hex,
    // });
    // console.log(erc20Hash);

    // const bankHash = await client.deployContract({
    //     abi: abi,
    //     args: ["0x56b9d2cf44789d9626593a3cd3b75bff9e6a64a0"],
    //     bytecode: bytecode["object"] as Hex,
    // });
    // console.log(bankHash);

    const { contractAddress } = await client.getTransactionReceipt(
        { hash: erc20_trx }
    );
    console.log('contract address:', contractAddress);


    const contract_erc20 = getContract({
        address: contractAddress as Hex,
        abi: erc20_abi,
        client,
    });
    const contract_bank = getContract({
        address: bank_address as Hex,
        abi: bank_abi,
        client,
    });

    // 查看余额
    const res = await contract_erc20.read.balanceOf([process.env.MAIN_ACCOUNT_PUB_KEY]);
    console.log('balance:', formatEther(res as bigint));

    // 查看余额
    // const balanceOfAddr =  await client.readContract({
    //     address: contractAddress as Hex,
    //     abi: erc20_abi,
    //     functionName: 'balanceOf',
    //     args: [process.env.MAIN_ACCOUNT_PUB_KEY ],
    // });
    // console.log('balance:', formatEther(balanceOfAddr as bigint));
    
    // 授权bank可以存取token
    const approve = await contract_erc20.write.approve([bank_address, 1000n]);
    console.log('approve:', approve);

    // 存款 (存款指定数量token到bank合约)
    await contract_bank.write.deposit([1000n]);

    // 显示用户的存款余额
    const balance = await contract_bank.read.addr_balance([account.address]);
    console.log('bank balance:', formatEther(balance as bigint));
    // 提款 (存款的用户进行提款)
    await contract_bank.write.withdraw([]);
})()

