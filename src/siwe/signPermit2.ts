import { encodePacked, keccak256, toHex, hexToBytes, Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { createPublicClient, http } from 'viem';
import dotenv from 'dotenv'
dotenv.config()
const private_key = process.env.ACCOUNT_FOR_DEV_PRIVATE_KEY;
async function main() {
    // 用户私钥（测试用，请勿暴露）
    const privateKey = private_key as Hex;

    // Permit2 合约地址（Sepolia 测试网）
    const permit2Address = '0xEdfC81c5326Ab4abDBafF66d09dd1F29ac5BE93F';

    // Token 地址
    const token = '0x32Ae70b4f364775e54741a6d60F0beb8333F2caA';

    // 构造 PermitTransferFrom 数据
    // const amount = 1000000000000000000n; // 1e18
    const amount = 200n;
    const nonce = 0n;
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600 * 24); // 1小时后过期
    console.log('deadline: ', deadline);

    // TYPE_HASH for PermitTransferFrom
    const PERMIT_TRANSFER_TYPEHASH = keccak256(new TextEncoder().encode(
        "PermitTransferFrom(TokenPermissions permitted,uint256 nonce,uint256 deadline)TokenPermissions(address token,uint256 amount)"
    ));

    // "PermitTransferFrom(TokenPermissions permitted,address spender,uint256 nonce,uint256 deadline)TokenPermissions(address token,uint256 amount)"

    // structHash = keccak256(abi.encode(PERMIT_TRANSFER_TYPEHASH, token, amount, nonce, deadline))
    const structHash = keccak256(
        encodePacked(
            ['bytes32', 'address', 'uint256', 'uint256', 'uint256'],
            [
                PERMIT_TRANSFER_TYPEHASH,
                token,
                amount,
                nonce,
                deadline
            ]
        )
    );

    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(),
    });
    // 获取 DOMAIN_SEPARATOR（从 Permit2 合约获取）
    const domainSeparator = await publicClient.readContract({
        address: permit2Address,
        abi: [
            {
                inputs: [],
                name: 'DOMAIN_SEPARATOR',
                outputs: [{ type: 'bytes32' }],
                type: 'function',
                constant: true,
            },
        ],
        functionName: 'DOMAIN_SEPARATOR',
    });

    // 构造 digest = keccak256("\x19\x01" + domainSeparator + structHash)
    const digest = keccak256(
        encodePacked(['bytes1', 'bytes1', 'bytes32', 'bytes32'], [
            '0x19',
            '0x01',
            domainSeparator as Hex,
            structHash
        ])
    );

    // 使用私钥签名
    const account = privateKeyToAccount(privateKey);
    const signature = await account.sign({ hash: digest });

    console.log('Signature:', signature);

}
main();

