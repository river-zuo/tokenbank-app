// components/DepositWithPermit2.tsx
// 'use client';

import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { encodePacked, keccak256, toHex, parseAbi } from 'viem';
import { useState } from 'react';

const permit2Address = '0xc92F434574Bb91974269AB7615Fa8B83A8761E34'; // 官方 Permit2 地址
const tokenAddress = '0x66036F16513Ed8f6892AE49c7C3714ba04aCF493';
const bankAddress = '0xDf8f4aaCde0130bea6f39031FD54e54d35281D5F';

const TokenPermissionsTypeHash = keccak256(
  toHex('TokenPermissions(address token,uint256 amount)')
);
const PermitTransferFromTypeHash = keccak256(
  toHex(
    'PermitTransferFrom(TokenPermissions permitted,address spender,uint256 nonce,uint256 deadline)TokenPermissions(address token,uint256 amount)'
  )
);

export function DepositWithPermit2() {
  const { address: owner } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [amount, setAmount] = useState<bigint>(1000000000000000000n); // 1 token
  const nonce = 0n;
  const deadline = BigInt(Math.floor(Date.now() / 1000 + 3600 * 24)); // 1小时有效期

  const signAndCall = async () => {
    if (!owner || !walletClient || !publicClient) return;

    // 构建 TokenPermissions 的 hash
    const tokenPermHash = keccak256(
      encodePacked(
        ['bytes32', 'address', 'uint256'],
        [TokenPermissionsTypeHash, tokenAddress, amount]
      )
    );

    // 构建 PermitTransferFrom 的 structHash
    const structHash = keccak256(
      encodePacked(
        ['bytes32', 'bytes32', 'address', 'uint256', 'uint256'],
        [PermitTransferFromTypeHash, tokenPermHash, bankAddress, nonce, deadline]
      )
    );

    // 获取 domainSeparator
    const domainSeparator = await publicClient.readContract({
      address: permit2Address,
      abi: parseAbi(['function DOMAIN_SEPARATOR() view returns (bytes32)']),
      functionName: 'DOMAIN_SEPARATOR',
    });

    // 构建 digest
    // const digest = keccak256(
    //   encodePacked(['string', 'bytes32', 'bytes32'], ['\x19\x01', domainSeparator, structHash])
    // );
    const digest = keccak256(
        encodePacked(["string", "bytes32", "bytes32"], ["\x19\x01", domainSeparator, structHash])
    )

    // 签名
    const signature = await walletClient.signMessage({
      account: owner,
      message: { raw: digest },
    });

    // 调用 spendWithPermit
    const result = await walletClient.writeContract({
      address: bankAddress,
      abi: [
        {
          inputs: [
            {
              components: [
                {
                  components: [
                    { name: 'token', type: 'address' },
                    { name: 'amount', type: 'uint256' },
                  ],
                  name: 'permitted',
                  type: 'tuple',
                },
                { name: 'nonce', type: 'uint256' },
                { name: 'deadline', type: 'uint256' },
              ],
              name: 'permit',
              type: 'tuple',
            },
            {
              components: [
                { name: 'to', type: 'address' },
                { name: 'requestedAmount', type: 'uint256' },
              ],
              name: 'transferDetails',
              type: 'tuple',
            },
            { name: 'owner', type: 'address' },
            { name: 'signature', type: 'bytes' },
          ],
          name: 'spendWithPermit',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ],
      functionName: 'spendWithPermit',
      args: [
        {
          permitted: {
            token: tokenAddress,
            amount: amount,
          },
          nonce,
          deadline,
        },
        {
          to: bankAddress,
          requestedAmount: amount,
        },
        owner,
        signature,
      ],
    });

    console.log('tx hash:', result);
  };

  return (
    <div>
      <h2 className="text-lg font-bold">Deposit with Permit2</h2>
      <button
        onClick={signAndCall}
        className="mt-2 px-4 py-2 rounded bg-blue-600 text-white"
      >
        Deposit with Signature
      </button>
    </div>
  );
}
