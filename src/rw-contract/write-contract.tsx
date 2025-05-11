import * as React from 'react'
import { type BaseError, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { abi as BaseERC20_abi } from '../../artifacts/BaseERC20.json'

const erc20_address = "0x56b9d2cf44789d9626593a3cd3b75bff9e6a64a0";

export function WriteContract() {
    const { data: hash, error, writeContract, isPending, } = useWriteContract()
    async function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        const addr_to = formData.get('addr_to') as string
        const amount = formData.get('amount') as string
        writeContract({
            address: erc20_address,
            abi: BaseERC20_abi,
            functionName: 'transfer',
            args: [addr_to, BigInt(amount)],
        })
    }
    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
            hash,
        })
    return (
        <form onSubmit={submit}>
            <input name="addr_to" placeholder="0x...." required />
            <input name="amount" type="number" placeholder="0" required />
            <button disabled={isPending} type="submit"> {isPending ? '正在转账...' : '转账'}</button>
            {hash && <div>Transaction Hash: {hash}</div>}
            {isConfirming && <div>Waiting for confirmation...</div>}
            {isConfirmed && <div>Transaction confirmed.</div>}
            {error && (
                <div>Error: {(error as BaseError).shortMessage || error.message}</div>
            )}
        </form>
    )
}
