import { createWalletClient, http, getContract, publicActions, parseEther, Hex, formatEther, TransactionReceipt } from 'viem';
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
    // .extend(publicActions)

    const contract_erc20 = getContract({
            address: erc20_address as Hex,
            abi: BaseERC20_abi,
            client,
        });

    // 查询余额
    const balance = await client.getBalance({
        address: account.address,
    });
    console.log('余额:', balance);
    console.log('余额:', formatEther(balance));
    
    // const txHash = await client.sendTransaction({
    //     to: process.env.MAIN_ACCOUNT_PUB_KEY as Hex,
    //     value: parseEther('0.00000179773368'), // 转账金额
    //     gas: 21000n,
    //     maxFeePerGas: parseEther('0.000000000002'), // 最大费用
    //     maxPriorityFeePerGas: parseEther('0.0000000000001'), // 优先费用
    // });
    // console.log('交易已发送，交易哈希:', txHash);

    // 查询余额
    // const lastBalanceA = await client.getBalance({
    //     address: account.address
    // });
    // console.log('转账后余额:', lastBalanceA);
    // console.log('余额:', formatEther(lastBalanceA));

    // if (true)  {
    //     return;
    // }
    const nonce = await client.getTransactionCount({ address: account.address });
    console.log('当前账户的 nonce:', nonce);
    // const erc20Contract = {
    //     address: erc20_address as Hex, // ERC20 合约地址
    //     // to: erc20_address as Hex, // ERC20 合约地址
    //     abi: BaseERC20_abi,
    //     nonce: nonce,
    // };

    // const transferAmount = 100; // 转账 100
    const trx = {
        to: erc20_address as Hex, // ERC20 合约地址
        // to: erc20_address as Hex, // ERC20 合约地址
        abi: BaseERC20_abi,
        nonce: nonce,
        // value: parseEther('0.000001'), // 转账金额
        functionName: 'transfer',
        chainId: 11155111,
        chain: sepolia,
        type: 'eip1559' as const,
        // 0x4251BA8F521CE6bAe071b48FC4621baF621057c5
        args: [process.env.MAIN_ACCOUNT_PUB_KEY as Hex, 100n], // 转账金额
        maxFeePerGas: parseEther('0.000000000002'), // 最大费用
        maxPriorityFeePerGas: parseEther('0.0000000000001'), // 优先费用
        gas: 53000n,
    };
    // 签名交易
    const signTrx = await client.signTransaction(trx);
    console.log('签名后的交易:', signTrx);
    // 发送交易
    const res_trx = await client.sendRawTransaction({
        
        serializedTransaction: signTrx,
    });
    console.log('交易哈希:', res_trx);

    const receipt = await client.waitForTransactionReceipt({ hash: res_trx });
    console.log('交易状态:', receipt.status === 'success' ? '成功' : '失败');

    // 等待交易确认
    // const receipt: TransactionReceipt = await client.waitForTransactionReceipt({ hash: res_trx })
    // console.log('交易状态:', receipt.status === 'success' ? '成功' : '失败')
    // console.log('区块号:', receipt.blockNumber)
    // console.log('Gas 使用量:', receipt.gasUsed.toString())

    // 查询余额
    // const lastBalance = await client.getBalance({
    //     address: account.address
    // });
    // console.log('转账后余额:', lastBalance);
    // console.log('余额:', formatEther(lastBalance));
}

createCLIWallet();

// 交易hash 0xbdbc31742d095b4916341a689c59568c7ce6c7ccadf3c436a6a49eb8f265873a
