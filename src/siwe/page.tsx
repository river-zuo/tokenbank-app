import { useState } from 'react';
import { createSiweMessage, verifySiweMessage } from 'viem/siwe';
import { createWalletClient, createPublicClient, custom, http, WalletClient, Hex } from 'viem';
import { mainnet, sepolia } from 'viem/chains';

// 添加 window.ethereum 的类型定义
declare global {
    interface Window {
        ethereum?: {
            request: (args: { method: string; params?: any[] }) => Promise<any>;
            on: (event: string, callback: (params: any) => void) => void;
            removeListener: (event: string, callback: (params: any) => void) => void;
        };
    }
}

export default function SiwePage() {
    const [address, setAddress] = useState<`0x${string}` | undefined>();
    const [isConnected, setIsConnected] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    // 创建公共客户端
    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(),
    });

    // 连接钱包
    const connectWallet = async () => {
        if (typeof window.ethereum === 'undefined') {
            alert('请安装 MetaMask');
            return;
        }

        try {
            const [address] = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setAddress(address as `0x${string}`);
            setIsConnected(true);
            setError('');
        } catch (error) {
            console.error('连接钱包失败:', error);
            setError('连接钱包失败');
        }
    };

    // SIWE 登录
    const handleSiweLogin = async () => {
        if (!address || !window.ethereum) return;

        try {
            const walletClient = createWalletClient({
                chain: sepolia,
                transport: custom(window.ethereum),
            });

            // signtypeedData
            // await getPermitSignature(walletClient);
            // await getPermitSignature2(walletClient);
            await getPermitSignature3(walletClient);

            if (true) {
                return;
            }


            // 创建 SIWE 消息
            const message = createSiweMessage({
                address,
                chainId: sepolia.id,
                domain: window.location.hostname,
                nonce: Math.random().toString(36).substring(2),
                uri: window.location.origin,
                version: '1',
                statement: '请签名以登录到我们的应用',
            });

            // 请求用户签名
            const signature = await walletClient.signMessage({
                account: address,
                message,
            });

            // 验证签名
            const isValid = await verifySiweMessage(publicClient, {
                message,
                signature,
            });

            if (isValid) {
                setIsAuthenticated(true);
                setError('');
                setSuccessMessage('SIWE 验证成功！');
                // 3秒后自动清除成功消息
                setTimeout(() => {
                    setSuccessMessage('');
                }, 3000);
            } else {
                setError('签名验证失败');
            }
        } catch (error) {
            console.error('SIWE 登录失败:', error);
            setError('SIWE 登录失败');
        }
    };

    // 登出
    const handleLogout = () => {
        setIsAuthenticated(false);
        setAddress(undefined);
        setIsConnected(false);
        setSuccessMessage('');
    };



    async function getPermitSignature(client: WalletClient) {
        const domain = {
            name: 'MY2612ERC20Permit', // ERC20Permit 的 name
            version: '1',
            chainId: sepolia.id,
            verifyingContract: "0x32Ae70b4f364775e54741a6d60F0beb8333F2caA" as Hex, // 合约地址
        };

        const types = {
            Permit: [
                { name: 'owner', type: 'address' },
                { name: 'spender', type: 'address' },
                { name: 'value', type: 'uint256' },
                { name: 'nonce', type: 'uint256' },
                { name: 'deadline', type: 'uint256' },
            ],
        };

        // const signer = '0x005a018ea9c6331667f1c50f2cea3b1061F70373';
        const signer = '0x4251BA8F521CE6bAe071b48FC4621baF621057c5';

        const curDate = Math.floor(Date.now() / 1000) + 3600 * 24;
        console.log("curDate:", curDate);
        const message = {
            owner: signer, // 签名者地址
            spender: '0xE317d04Be77e4D9D96D2442E2B33Afd3D121dE56', // 被授权的地址
            value: 1000, // 授权的代币数量
            nonce: 2, // 签名者的当前 nonce（从合约中获取）
            deadline: curDate, // 当前时间 + 1 小时
        };

        const signature = await client.signTypedData({
            domain,
            types,
            primaryType: 'Permit', // 主类型名称
            message,
            account: signer, // 签名者地址
        });
        const resData = splitSignature(signature);
        console.log("typed data:", resData);
    }

    async function getPermitSignature2(client: WalletClient) {
        const domain = {
            name: 'NFTpermitBuy', // ERC20Permit 的 name
            version: '1',
            chainId: sepolia.id,
            verifyingContract: "0xd155AD1ff981abE77862D89725e4C0Ef27Bb09A8" as Hex, // 合约地址
        };

        const types = {
            PermitBuy: [
                { name: 'buyer', type: 'address' },
                { name: 'tokenId', type: 'uint256' },
                { name: 'nonce', type: 'uint256' },
                { name: 'deadline', type: 'uint256' },
            ],
        };

        // const signer = '0x005a018ea9c6331667f1c50f2cea3b1061F70373';
        const signer = '0x4251BA8F521CE6bAe071b48FC4621baF621057c5';

        const curDate = Math.floor(Date.now() / 1000) + 3600 * 24;
        console.log("curDate:", curDate);
        const message = {
            buyer: signer, // 签名者地址
            tokenId: 1, // nft_id
            nonce: 1, // 签名者的当前 nonce（从合约中获取）
            deadline: curDate, // 当前时间 + 1 小时
        };

        const signature = await client.signTypedData({
            domain,
            types,
            primaryType: 'PermitBuy', // 主类型名称
            message,
            account: signer, // 签名者地址
        });
        const resData = splitSignature(signature);
        console.log("getPermitSignature2 typed data:", resData);
    }

    async function getPermitSignature3(client: WalletClient) {
        const domain = {
            name: 'Permit2', // ERC20Permit 的 name  Permit2
            // version: '1',
            chainId: sepolia.id,
            verifyingContract: "0xEdfC81c5326Ab4abDBafF66d09dd1F29ac5BE93F" as Hex, // 合约地址
        };

        const permit2Types = {
            PermitTransferFrom: [
                { name: 'permitted', type: 'TokenPermissions' },
                { name: 'nonce', type: 'uint256' },
                { name: 'deadline', type: 'uint256' }
            ],
            TokenPermissions: [
                { name: 'token', type: 'address' },
                { name: 'amount', type: 'uint256' }
            ]
        };

        // const signer = '0x005a018ea9c6331667f1c50f2cea3b1061F70373';
        const signer = '0x4251BA8F521CE6bAe071b48FC4621baF621057c5';

        const curDate = Math.floor(Date.now() / 1000) + 3600 * 24;
        console.log("curDate:", curDate);
        // const message = {
        //     buyer: signer, // 签名者地址
        //     tokenId: 1, // nft_id
        //     nonce: 1, // 签名者的当前 nonce（从合约中获取）
        //     deadline: curDate, // 当前时间 + 1 小时
        // };

        const message = {
            permitted: {
                token: '0x32Ae70b4f364775e54741a6d60F0beb8333F2caA',
                amount: 200 // 1 token, 18 decimals
            },
            nonce: 0, // 用户当前nonce
            deadline: curDate // 1小时后过期
            };

        const signature = await client.signTypedData({
            domain,
            types: permit2Types,
            primaryType: 'PermitTransferFrom', // 主类型名称
            message,
            account: signer, // 签名者地址
        });
        console.log("getPermitSignature3 signature:", signature);
        // const resData = splitSignature(signature);
        // console.log("getPermitSignature2 typed data:", resData);
    }

    // Helper: 分割签名
    // Helper: 分割签名
    function splitSignature(signature) {
        const r = signature.slice(0, 66);
        const s = '0x' + signature.slice(66, 130);
        const v = parseInt(signature.slice(130, 132), 16);
        return { v, r, s };
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8">
            <h1 className="text-3xl font-bold mb-8">SIWE 登录</h1>

            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
                {!isConnected ? (
                    <button
                        onClick={connectWallet}
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                    >
                        连接 MetaMask
                    </button>
                ) : !isAuthenticated ? (
                    <div className="space-y-4">
                        <div className="text-center">
                            <p className="text-gray-600">钱包地址:</p>
                            <p className="font-mono break-all">{address}</p>
                        </div>
                        <button
                            onClick={handleSiweLogin}
                            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
                        >
                            SIWE 登录
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="text-center">
                            <p className="text-gray-600">已登录地址:</p>
                            <p className="font-mono break-all">{address}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
                        >
                            登出
                        </button>
                    </div>
                )}

                {error && (
                    <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="mt-4 p-3 bg-green-100 text-green-700 rounded animate-fade-in">
                        {successMessage}
                    </div>
                )}
            </div>
        </div>
    );
} 