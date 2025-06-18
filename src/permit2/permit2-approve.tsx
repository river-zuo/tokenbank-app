import * as React from 'react'
import { type BaseError, useWaitForTransactionReceipt, useWriteContract, useReadContract, useAccount } from 'wagmi'
import { abi as BaseERC20_abi } from '../../artifacts/BaseERC20.json'
import { abi as TokenBankPermit2_abi } from '../../artifacts/TokenBankDepositPermit2.json'

const permit2_erc20_address = "0x66036F16513Ed8f6892AE49c7C3714ba04aCF493";
// Permit2合约地址
const permit2_address = "0xc92F434574Bb91974269AB7615Fa8B83A8761E34";

const permit2_bank_address = "0xDf8f4aaCde0130bea6f39031FD54e54d35281D5F";

export function Permit2Approve() {
    const { isConnected, address: AccountAddr } = useAccount()
    const { data: hash, error, writeContract, isPending, } = useWriteContract()
    // 获取当前账户余额
    const {data: _balance, refetch: refetchBalance,} = useReadContract({
                address: permit2_erc20_address,
                abi: BaseERC20_abi,
                functionName: 'balanceOf',
                args: [AccountAddr],
                query: {
                    enabled: false, // 默认不触发查询
                }
            })
    // 查看授权给permit2合约的额度
    const {data: allowance, refetch: allowance_refetchBalance,} = useReadContract({
                address: permit2_erc20_address,
                abi: BaseERC20_abi,
                functionName: 'allowance',
                args: [AccountAddr, permit2_address],
                query: {
                    enabled: !!AccountAddr, // 默认不触发查询
                }
            })
    async function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        // const amount = formData.get('amount') as string
        
        // 获取账户余额
        const results = await refetchBalance();
        const balance = results.data;
        console.log('账户余额_results_data:', results.data?.toString())
        
        writeContract({
            address: permit2_erc20_address,
            abi: BaseERC20_abi,
            functionName: 'approve',
            args: [permit2_address, balance],
        })
    }
    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
            hash,
        })
    return (
        <form onSubmit={submit}>
            {/* <input name="amount" type="number" placeholder="0" required /> */}
            <button disabled={isPending} type="submit"> {isPending ? '正在授权permit2...' : '授权permit2'}</button>
            {hash && <div>Transaction Hash: {hash}</div>}
            {isConfirming && <div>Waiting for confirmation...</div>}
            {isConfirmed && <div>Transaction confirmed.</div>}
            {error && (
                <div>Error: {(error as BaseError).shortMessage || error.message}</div>
            )}
            <div>授权permit2额度: {allowance ? allowance.toString() : '加载中...'}</div>
        </form>
    )
}
