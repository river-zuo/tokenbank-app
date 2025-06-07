import * as React from 'react'
import { useState } from 'react'
import { type BaseError, useWaitForTransactionReceipt, useWriteContract, useWalletClient, usePublicClient } from 'wagmi'
import { encodeFunctionData, TransactionReceipt, http, createPublicClient, Hex } from 'viem'
import { mainnet, sepolia } from 'viem/chains'
import { abi as BaseERC20_abi } from '../../artifacts/BaseERC20.json'
import { abi as TokenBankV2_abi } from '../../artifacts/TokenBankV2.json'
import { abi as EIP7702_abi } from '../../artifacts/EIP7702Delegate.json'
import { encode } from 'punycode'
import { write } from 'fs'
import { writeContract as viemWriteContract } from 'viem/actions'

const erc20_address = "0x56b9d2cf44789d9626593a3cd3b75bff9e6a64a0";
const bank_address = "0x0d1ac1a9a830904b6b447f82785e67b377ec1ecb";
const eip7702_address: `0x${string}` = "0x6aAEb290A5d2BF4297924A6abE02502aeA1b1159"; // EIP-7702合约地址

// const smartAccount = {
//     type: 'local',
//     address: eip7702_address, // 通常是你的合约地址或代理地址
// }

// metamask钱包还不支持 EIP-7702 授权

export function EIP7702WriteApproveBankContract() {
    const { data: _hash, error, writeContract, isPending: _isPending, } = useWriteContract()

    const [isPending, setIsPending] = useState(false); // 使用本地状态管理 isPending
    const [txHash, setTxHash] = useState<Hex | undefined>(undefined)

    // const publicClient = createPublicClient({
    //     chain: sepolia,
    //     transport: http(process.env.RPC_URL!),
    // });

    //     transaction: AccountTypeNotSupportedError: Account type "json-rpc" is not supported.
    // The `signAuthorization` Action does not support JSON-RPC Accounts.

    const { data: walletClient } = useWalletClient()
    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
            hash: txHash,
        })
    async function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsPending(true) // 设置 isPending 为 true
        try {
            const formData = new FormData(e.target as HTMLFormElement)
            const amount = formData.get('amount') as string

            // 生成approve调用数据
            const approveCall = encodeFunctionData({
                abi: BaseERC20_abi,
                functionName: 'approve',
                args: [bank_address, BigInt(amount)],
            })

            // 生成deposit调用数据
            const depositCall = encodeFunctionData({
                abi: TokenBankV2_abi,
                functionName: 'deposit',
                args: [BigInt(amount)],
            })

            // 1.构造 EIP712 Typed Data
            const chainId = await walletClient?.getChainId()

            const typedData = {
                domain: {
                    name: 'EIP7702',
                    version: '1',
                    chainId,
                    verifyingContract: eip7702_address,
                },
                types: {
                    Authorization: [
                        { name: 'contractAddress', type: 'address' },
                        { name: 'executor', type: 'address' },
                        { name: 'nonce', type: 'uint256' },
                        { name: 'validAfter', type: 'uint48' },
                        { name: 'validBefore', type: 'uint48' },
                        { name: 'callGasLimit', type: 'uint256' },
                        { name: 'verificationGasLimit', type: 'uint256' },
                        { name: 'preVerificationGas', type: 'uint256' },
                        { name: 'maxFeePerGas', type: 'uint256' },
                        { name: 'maxPriorityFeePerGas', type: 'uint256' },
                        { name: 'paymasterAndData', type: 'bytes' },
                    ],
                },
                primaryType: 'Authorization' as const,
                message: {
                    contractAddress: eip7702_address,
                    executor: walletClient?.account.address,
                    nonce: 0,
                    validAfter: 0,
                    validBefore: 2n ** 48n - 1n,
                    callGasLimit: 1_000_000n,
                    verificationGasLimit: 1_000_000n,
                    preVerificationGas: 100_000n,
                    maxFeePerGas: 10n ** 9n,
                    maxPriorityFeePerGas: 10n ** 9n,
                    paymasterAndData: '0x',
                },
            }
            // 2.请求用户授权
            const signature = await walletClient?.signTypedData({
                account: walletClient.account,
                domain: typedData.domain,
                types: typedData.types,
                primaryType: typedData.primaryType,
                message: typedData.message,
            })
            console.log('Signature passed..')
            // 3.组装 authorizationList
            const authorizationList = [
                {
                    address: walletClient?.account.address!, // 替换 executor 为 address
                    chainId: chainId!, // 添加 chainId 字段
                    contractAddress: eip7702_address,
                    nonce: 0,
                    validAfter: 0,
                    validBefore: 2n ** 48n - 1n,
                    callGasLimit: 1_000_000n,
                    verificationGasLimit: 1_000_000n,
                    preVerificationGas: 100_000n,
                    maxFeePerGas: 10n ** 9n,
                    maxPriorityFeePerGas: 10n ** 9n,
                    paymasterAndData: '0x',
                    signature: signature!,
                },
            ]
            // // 5. 生成 EIP-7702 授权
            // const authorization = await walletClient?.signAuthorization({
            //     // account: eoa,
            //     contractAddress: eip7702_address,
            //     executor: 'self',
            // });

            // // 明确检查 authorization 是否存在
            // if (!authorization) {
            //     console.error("Failed to generate authorization")
            //     return
            // }

            const hash = await walletClient?.writeContract({
                abi: EIP7702_abi,
                address: walletClient?.account.address,
                // authorizationList: [authorization],
                authorizationList,
                functionName: 'multiExec',
                args: [[erc20_address, bank_address], [approveCall, depositCall]],
            })

            if (hash) {
                setTxHash(hash as Hex)
            }

        } catch (err) {
            console.error('Error during transaction:', err)
        } finally {
            setIsPending(false) // 设置 isPending 为 false
        }
    }

    return (
        <form onSubmit={submit}>
            <input name="amount" type="number" placeholder="0" required />
            <button disabled={isPending} type="submit"> {isPending ? '正在授权并转账...' : '银行授权并转账'}</button>
            {txHash && <div>Transaction Hash: {txHash}</div>}
            {isConfirming && <div>Waiting for confirmation...</div>}
            {isConfirmed && <div>Transaction confirmed.</div>}
            {/* {error && (
                <div>Error: {(error as BaseError).shortMessage || error.message}</div>
            )} */}
        </form>
    )
}
