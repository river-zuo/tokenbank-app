import * as React from 'react'
import { type BaseError, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { abi as TokenBank_abi } from '../../artifacts/TokenBankPermitDeposit.json'

const tokenBank_address = "0xE317d04Be77e4D9D96D2442E2B33Afd3D121dE56";

export function PermitBuyWithSign() {
    const { data: hash, error, writeContract, isPending, } = useWriteContract()
    async function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        
        const amount = formData.get('amount') as string
        const deadline = formData.get('deadline') as string
        const v = formData.get('v') as string
        const r = formData.get('r') as string
        const s = formData.get('s') as string
        writeContract({
            address: tokenBank_address,
            abi: TokenBank_abi,
            functionName: 'permitDeposit',
            args: [BigInt(amount), BigInt(deadline), v, r, s],
        })
    }
    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
            hash,
        })
    return (
        <form onSubmit={submit}>
            <input name="amount" type="number" placeholder="金额" required />
            <input name="deadline" type="number" placeholder="签名到期时间" required />
            <input name="v" type="number" placeholder="v" required />
            <input name="r" type="number" placeholder="r" required />
            <input name="s" type="number" placeholder="s" required />
            <button disabled={isPending} type="submit"> {isPending ? '正在离线签名存款...' : '离线签名存款'}</button>
            {hash && <div>Transaction Hash: {hash}</div>}
            {isConfirming && <div>Waiting for confirmation...</div>}
            {isConfirmed && <div>Transaction confirmed.</div>}
            {error && (
                <div>Error: {(error as BaseError).shortMessage || error.message}</div>
            )}
        </form>
    )
}
