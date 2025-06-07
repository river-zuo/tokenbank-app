import { createPublicClient, createWalletClient, encodeFunctionData, TransactionReceipt, formatEther, getContract, Hex, http, publicActions } from 'viem'
import { mainnet, sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import dotenv from 'dotenv'
import tokenBankJson from '../../artifacts/TokenBankV2.json'
import baseERC20 from '../../artifacts/BaseERC20.json'
import { abi as BaseERC20_abi } from '../../artifacts/BaseERC20.json'
import { abi as TokenBankV2_abi } from '../../artifacts/TokenBankV2.json'
import { abi as EIP7702_abi } from '../../artifacts/EIP7702Delegate.json'

const { abi, bytecode } = tokenBankJson
// const {abi, bytecode} = baseERC20

dotenv.config()

const privateKey = process.env.ACCOUNT_FOR_DEV_PRIVATE_KEY
const account = privateKeyToAccount(privateKey as Hex)

    ;
const erc20_address = "0x56b9d2cf44789d9626593a3cd3b75bff9e6a64a0";

const bank_address = "0x0d1ac1a9a830904b6b447f82785e67b377ec1ecb";

const eip7702_address = "0x6aAEb290A5d2BF4297924A6abE02502aeA1b1159"; // EIP-7702合约地址


(async () => {

    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(process.env.RPC_URL!),
    });

    const walletClient = createWalletClient({
        account: account,
        chain: sepolia,
        transport: http(process.env.SEPOLIA_RPC_URL),
    }).extend(publicActions);


    const amount = "200"

    // 生成approve调用数据
    const approveCall = encodeFunctionData({
        abi: BaseERC20_abi,
        functionName: 'approve',
        args: [bank_address, BigInt(amount)],
    })

    console.log('approveCall', approveCall)

    // 生成deposit调用数据
    const depositCall = encodeFunctionData({
        abi: TokenBankV2_abi,
        functionName: 'deposit',
        args: [BigInt(amount)],
    })

    console.log('depositCall', depositCall)


    // 生成 EIP-7702 授权
    const authorization = await walletClient.signAuthorization({
        // account: eoa,
        contractAddress: eip7702_address,
        executor: 'self',
    });

    const hash = await walletClient.writeContract({
        abi: EIP7702_abi,
        address: walletClient.account.address,
        authorizationList: [authorization],
        functionName: 'multiExec',
        args: [[erc20_address, bank_address], [approveCall, depositCall]],
    })


  const receipt: TransactionReceipt = await publicClient.waitForTransactionReceipt({ hash: hash })
  console.log('交易状态:', receipt.status === 'success' ? '成功' : '失败')

})()

