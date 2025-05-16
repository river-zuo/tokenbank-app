import { encodePacked, Hex, keccak256, toHex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import dotenv from 'dotenv'
dotenv.config()
const private_key = process.env.ACCOUNT_FOR_DEV_PRIVATE_KEY;

async function signV2() {
    // 用户私钥（请勿暴露）
    const privateKey = private_key as Hex;

    // Permit2 DOMAIN_SEPARATOR (可通过合约获取)
    const domainSeparator = '0x5bb09ce53618d1c3212ac7b1806f35f9d2e0fa41d7940cb6c56bb2b89bdb6ab3'; // 替换为 Permit2 合约的 DOMAIN_SEPARATOR

    // PermitTransferFrom 数据
    const token = '0x32Ae70b4f364775e54741a6d60F0beb8333F2caA';
    const amount = 1000000000000000000n; // 1e18
    const nonce = 0n;
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1小时后过期
    console.log('deadline: ', deadline);
    // TYPEHASH for PermitTransferFrom(TokenPermissions,uint256,uint256)
    const PERMIT_TRANSFER_TYPEHASH = keccak256(
        new TextEncoder().encode(
            "PermitTransferFrom(TokenPermissions permitted,uint256 nonce,uint256 deadline)TokenPermissions(address token,uint256 amount)"
        )
    );

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

    // digest = keccak256("\x19\x01" + domainSeparator + structHash)
    const digest = keccak256(
        encodePacked(['bytes1', 'bytes1', 'bytes32', 'bytes32'], [
            '0x19',
            '0x01',
            domainSeparator,
            structHash
        ])
    );

    // 使用私钥签名
    const account = privateKeyToAccount(privateKey);
    const signature = await account.sign({ hash: digest });

    console.log('Signature:', signature);
}

signV2();
