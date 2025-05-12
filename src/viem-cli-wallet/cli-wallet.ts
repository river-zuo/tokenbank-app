import { createWalletClient, http, getContract, publicActions, parseEther, Hex, formatEther } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import dotenv from 'dotenv'
dotenv.config()

import { abi as BaseERC20_abi } from '../../artifacts/BaseERC20.json'

const erc20_address = "0x56b9d2cf44789d9626593a3cd3b75bff9e6a64a0";

async function createCLIWallet() {
    // 生成私钥
    // const privateKey = generatePrivateKey();
    // console.log('私钥:', privateKey);
    // 0x193e03a27953d2069b060c7f231fd69b4ac6bd01894e65953542c24838ecb04a
    // 上面代码生成一下私钥
    const privateKey = "0x193e03a27953d2069b060c7f231fd69b4ac6bd01894e65953542c24838ecb04a";
    // 0xa84Df1CDCdBfb8cf83c8C34f452A2fCbEcDeF04A
    const account = privateKeyToAccount(privateKey);
    console.log('私钥对应的地址:', account.address);

    // 创建客户端
    const client = createWalletClient({
        account: account,
        chain: sepolia,
        transport: http(process.env.SEPOLIA_RPC_URL),
    }).extend(publicActions);
    // 查询余额
    const balance = await client.getBalance({
        address: account.address
    });
    console.log('余额:', balance);
    console.log('余额:', formatEther(balance));
    
    // if (true)  {
    //     return;
    // }
    const erc20Contract = {
        address: erc20_address as Hex, // ERC20 合约地址
        abi: BaseERC20_abi,
    };

    const transferAmount = 100; // 转账 100
    const trx = {
        ...erc20Contract,
        functionName: 'transfer',
        args: [process.env.MAIN_ACCOUNT_PUB_KEY as Hex, transferAmount], // 转账金额
        maxFeePerGas: parseEther('0.0000008'), // 最大费用
        maxPriorityFeePerGas: parseEther('0.00000001'), // 优先费用
        gas: 53000n,
    };
    // 签名交易
    const signTrx = await client.signTransaction(trx);
    // 发送交易
    const res_trx = await client.sendRawTransaction({
        serializedTransaction: signTrx,
    });
    console.log('交易哈希:', res_trx);

    // 查询余额
    const lastBalance = await client.getBalance({
        address: account.address
    });
    console.log('转账后余额:', lastBalance);
    console.log('余额:', formatEther(lastBalance));
}

createCLIWallet();

// 交易hash 0xbdbc31742d095b4916341a689c59568c7ce6c7ccadf3c436a6a49eb8f265873a
