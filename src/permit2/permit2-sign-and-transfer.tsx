import * as React from 'react'
import { type BaseError, useWaitForTransactionReceipt, useWriteContract, useReadContract, useAccount, useSignMessage, usePublicClient } from 'wagmi'
import { encodePacked, keccak256, toHex, hexToBytes, Hex } from 'viem'
import { abi as BaseERC20_abi } from '../../artifacts/BaseERC20.json'
// import { abi as TokenBankV2_abi } from '../../artifacts/TokenBankV2.json'
import { abi as TokenBankPermit2_abi } from '../../artifacts/TokenBankDepositPermit2.json'
import { abi as Permit2_abi } from '../../artifacts/MyPermit2.json'
import { sign } from 'crypto'
import { Signature } from 'ethers'

const erc20_address = "0x56b9d2cf44789d9626593a3cd3b75bff9e6a64a0";
const bank_address = "0x0d1ac1a9a830904b6b447f82785e67b377ec1ecb";

const permit2_erc20_address = "0x66036F16513Ed8f6892AE49c7C3714ba04aCF493";
// Permit2合约地址
const permit2_address = "0xc92F434574Bb91974269AB7615Fa8B83A8761E34";
const permit2_bank_address = "0xDf8f4aaCde0130bea6f39031FD54e54d35281D5F";


export function Permit2SignAndTransfer() {
    const { data: hash, error, writeContract, isPending, } = useWriteContract()
    const { isConnected, address: AccountAddr } = useAccount()
    const publicClient = usePublicClient()
    
    const { data: _signature, signMessage, signMessageAsync } = useSignMessage();
    // 获取nonce
    const { refetch: refetchNonce } = useReadContract({
        address: permit2_address,
        abi: Permit2_abi,
        functionName: 'nonceBitmap',
        args: [AccountAddr, 0],
        query: {
            enabled: false, // 默认不触发查询
        }
    });
    // 获取 DOMAIN_SEPARATOR
    const {
        data: domainSeparator } = useReadContract({
            address: permit2_address,
            abi: Permit2_abi,
            functionName: 'DOMAIN_SEPARATOR',
            args: [],
        })
    async function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        const amount = formData.get('amount') as string
        console.log('amount:', amount)
        const resNonce = await refetchNonce();
        let curNonce = resNonce.data;
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600 * 24); // 1 day
        console.log('nonce: ', curNonce);
        // 签名
        const curPermit = {
            permitted: {
                token: permit2_erc20_address,
                amount: amount, // 1e18
            },
            nonce: curNonce,
            deadline: deadline
        };

        const structHash = await publicClient!.readContract({
            address: permit2_bank_address,
            abi: TokenBankPermit2_abi,
            functionName: 'hashPermitTransferFrom',
            args: [curPermit, permit2_bank_address],
        })
        
        console.log('_structHash: ', structHash);
        // 构造
        // const digest = keccak256("\x19\x01" + domainSeparator + structHash)
        const digest = keccak256(
            encodePacked(['bytes1', 'bytes1', 'bytes32', 'bytes32'], [
                '0x19' as Hex,
                '0x01' as Hex,
                domainSeparator as Hex,
                structHash as Hex
            ])
        );
        const signature = await signMessageAsync({ account: AccountAddr, message: { raw: digest } });
        console.log('signature: ', signature);
        // 0x763ae33fa680c130d8239b9247d9ecc5fc8f684c9c50cf466178b3af20ac858c0b50847b72f351b8f8b71d7eb0bdeeeb4243dcbf98082c3c841523585cec22671b

        const bytes = hexToBytes(signature); // Uint8Array

        const r = bytes.slice(0, 32);
        const s = bytes.slice(32, 64);
        const v = bytes[64]; // 是数字（27 or 28）

        console.log({ r, s, v });

        // tokenbank通过permit2进行存款
        const transferDetails = {
            to: AccountAddr,
            requestedAmount: amount,
        }
        const owner = AccountAddr;
        writeContract({
            address: permit2_bank_address,
            abi: TokenBankPermit2_abi,
            functionName: 'spendWithPermit',
            args: [curPermit, transferDetails, owner, signature],
        })
        // writeContract({
        //     address: permit2_bank_address,
        //     abi: TokenBankPermit2_abi,
        //     functionName: 'depositWithPermit2',
        //     args: [permit2_erc20_address, amount, curNonce, deadline, permit2_bank_address, AccountAddr, signature],
        // })
    }
    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
            hash,
        })
    return (
        <form onSubmit={submit} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md space-y-4">
            <input name="amount" type="number" placeholder="0" required 
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"/>
            <button disabled={isPending} type="submit"
            className={`w-full py-2 rounded-md text-white font-semibold transition
            ${isPending ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
            `}
            > {isPending ? '正在签名并存款...' : '(permit2)签名并存款'}</button>
            {hash && <div>Transaction Hash: {hash}</div>}
            {isConfirming && <div>Waiting for confirmation...</div>}
            {isConfirmed && <div>Transaction confirmed.</div>}
            {error && (
                <div>Error: {(error as BaseError).shortMessage || error.message}</div>
            )}
        </form>
    )
}
