import { createWalletClient, formatEther, Hex, http, parseEther, parseGwei, type Hash, publicActions, type TransactionReceipt, encodeFunctionData } from 'viem'
import { prepareTransactionRequest } from 'viem/actions'
import { mnemonicToAccount, privateKeyToAccount, type PrivateKeyAccount } from 'viem/accounts'
import { foundry, sepolia } from 'viem/chains'
import { abi as BaseERC20_abi } from '../../artifacts/BaseERC20.json'
import { createPublicClient, type PublicClient, type WalletClient } from 'viem'
import dotenv from 'dotenv'

dotenv.config()

const erc20_address = "0x56b9d2cf44789d9626593a3cd3b75bff9e6a64a0";

async function sendTransactionExample(): Promise<Hash> {
  try {
    // const privateKey = generatePrivateKey()

    // 1. 从环境变量获取私钥
    // const privateKey = process.env.PRIVATE_KEY as `0x${string}`
    const privateKey = "0x193e03a27953d2069b060c7f231fd69b4ac6bd01894e65953542c24838ecb04a";
    if (!privateKey) {
      throw new Error('请在 .env 文件中设置 PRIVATE_KEY')
    }

    // 使用助记词 推导账户
    // const account = mnemonicToAccount('xxxx xxx ') 
    // 使用私钥 推导账户
    const account: PrivateKeyAccount = privateKeyToAccount(privateKey)
    const userAddress = account.address
    console.log('账户地址:', userAddress)

    // 创建公共客户端
    const publicClient: PublicClient = createPublicClient({
      chain: sepolia,
      transport: http(process.env.RPC_URL)
    })

    // 检查网络状态
    const blockNumber = await publicClient.getBlockNumber()
    console.log('当前区块号:', blockNumber)

    // 获取当前 gas 价格
    const gasPrice = await publicClient.getGasPrice()
    console.log('当前 gas 价格:', parseGwei(gasPrice.toString()))

    // 查询余额
    const balance = await publicClient.getBalance({
      address: userAddress
    })
    console.log('账户余额:', parseEther(balance.toString()))
    console.log('账户余额:', formatEther(balance))

    // 查询nonce
    const nonce = await publicClient.getTransactionCount({
      address: userAddress
    })
    console.log('当前 Nonce:', nonce)

    const data = encodeFunctionData({
        abi: BaseERC20_abi,
        functionName: 'transfer',
        args: [process.env.MAIN_ACCOUNT_PUB_KEY as Hex, 100n],
      });
      console.log('data:', data);
    // 2. 构建交易参数
    const txParams = {
      account: account,
      to: erc20_address as Hex, // 目标地址
    //   value: parseEther('0.00001'), // 发送金额（ETH）
    //   functionName: 'transfer',
    //   abi: BaseERC20_abi,
    //   args: [process.env.MAIN_ACCOUNT_PUB_KEY as Hex, 10n], // 转账金额
      data: data,
      chainId: sepolia.id,
      type: 'eip1559' as const, // 使用 const 断言确保类型正确
      chain: sepolia, // 添加 chain 参数
      
      // EIP-1559 交易参数
      maxFeePerGas: gasPrice * 2n, // 最大总费用为当前 gas 价格的 2 倍
    //   maxPriorityFeePerGas: parseGwei('1.5'), // 最大小费
    //   gas: 21000n,   // gas limit
      maxPriorityFeePerGas: 20n, // 最大小费
      gas: 100000n,   // gas limit parseEther('0.000005298')
      nonce: nonce,
    }

    // 或 自动 Gas 估算 及参数验证和补充
    // const preparedTx = await prepareTransactionRequest(publicClient, txParams)
    // console.log('准备后的交易参数:', {
    //   ...preparedTx,
    //   maxFeePerGas: parseGwei(preparedTx.maxFeePerGas.toString()),
    //   maxPriorityFeePerGas: parseGwei(preparedTx.maxPriorityFeePerGas.toString()),
    // })

    // 创建钱包客户端
    const walletClient: WalletClient = createWalletClient({
      account: account,
      chain: sepolia,
    //   transport: http(process.env.RPC_URL),
      transport: http(process.env.SEPOLIA_RPC_URL)
    }).extend(publicActions)

    // // 方式 1：直接发送交易
    // const txHash1 = await walletClient.sendTransaction(preparedTx)
    // console.log('交易哈希:', txHash1)

    // 方式 2 ： 
    // 签名交易
    const signedTx = await walletClient.signTransaction(txParams)
    console.log('Signed Transaction:', signedTx)

    // 发送交易  eth_sendRawTransaction publicClient
    const txHash = await walletClient.sendRawTransaction({
        serializedTransaction: signedTx
    })
    console.log('Transaction Hash:', txHash)

    // 等待交易确认
    const receipt: TransactionReceipt = await publicClient.waitForTransactionReceipt({ hash: txHash })
    console.log('交易状态:', receipt.status === 'success' ? '成功' : '失败')
    console.log('区块号:', receipt.blockNumber)
    console.log('Gas 使用量:', receipt.gasUsed.toString())

    return txHash

  } catch (error) {
    console.error('错误:', error)
    if (error instanceof Error) {
      console.error('错误信息:', error.message)
    }
    if (error && typeof error === 'object' && 'details' in error) {
      console.error('错误详情:', error.details)
    }
    throw error
  }
}

// 执行示例
sendTransactionExample() 
