// SpendWithPermit.tsx
import React, { useState } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { PermitTransferFrom, SignatureTransfer } from '@uniswap/permit2-sdk'
import { encodeFunctionData } from 'viem'

const PERMIT2_ADDRESS = '0xc92F434574Bb91974269AB7615Fa8B83A8761E34'
const BANK_ADDRESS = '0xDf8f4aaCde0130bea6f39031FD54e54d35281D5F'
const TOKEN_ADDRESS = '0x66036F16513Ed8f6892AE49c7C3714ba04aCF493'

export function SpendWithPermit() {
  const { address: owner } = useAccount()
  const { data: walletClient } = useWalletClient()
  const [amount, setAmount] = useState('1') // default 1 token
  const [txHash, setTxHash] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!owner || !walletClient) return alert('钱包未连接')

    const amountRaw = BigInt(Number(amount) * 1e18)
    const nonce = 0
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600)

    const permit: PermitTransferFrom = {
      permitted: {
        token: TOKEN_ADDRESS,
        amount: amountRaw,
      },
      spender: BANK_ADDRESS,
      nonce,
      deadline,
    }

    const chainId = await walletClient.getChainId()

    const { domain, types, values } = SignatureTransfer.getPermitData(
      permit,
      PERMIT2_ADDRESS,
      chainId
    )

    console.log({ domain, types, values })

    const signature = await walletClient.signTypedData({
      domain,
      types,
      primaryType: 'PermitTransferFrom',
      message: values,
    })

    const transferDetails = {
      to: BANK_ADDRESS,
      requestedAmount: amountRaw,
    }

    // 构造 calldata
    const calldata = encodeFunctionData({
      abi: [
        {
          name: 'spendWithPermit',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            {
              name: 'permit',
              type: 'tuple',
              components: [
                {
                  name: 'permitted',
                  type: 'tuple',
                  components: [
                    { name: 'token', type: 'address' },
                    { name: 'amount', type: 'uint256' },
                  ],
                },
                { name: 'nonce', type: 'uint256' },
                { name: 'deadline', type: 'uint256' },
              ],
            },
            {
              name: 'transferDetails',
              type: 'tuple',
              components: [
                { name: 'to', type: 'address' },
                { name: 'requestedAmount', type: 'uint256' },
              ],
            },
            { name: 'owner', type: 'address' },
            { name: 'signature', type: 'bytes' },
          ],
        },
      ],
      functionName: 'spendWithPermit',
      args: [permit, transferDetails, owner, signature],
    })

    // 发送交易
    const hash = await walletClient.sendTransaction({
      account: owner,
      to: BANK_ADDRESS,
      data: calldata,
    })

    setTxHash(hash)
  }

  return (
    <div className="p-4 border rounded max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-bold">Permit2 授权存入</h2>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="输入转账 Token 数量"
        className="p-2 border w-full"
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        使用 Permit2 转账
      </button>
      {txHash && (
        <div>
          ✅ 交易发送成功：
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-500 underline ml-1"
          >
            查看 Etherscan
          </a>
        </div>
      )}
    </div>
  )
}
