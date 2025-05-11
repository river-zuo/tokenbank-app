import React, { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { createPublicClient, getContract, formatEther } from 'viem';
import { sepolia } from 'wagmi/chains';

// Extend the Window interface to include the ethereum property
declare global {
    interface Window {
        ethereum?: any;
    }
}
const App: React.FC = () => {
    const { address, isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();
    const [balance, setBalance] = useState<string | null>(null);

    const handleReadBalance = async () => {
        if (!isConnected || !address) {
            console.error('Wallet not connected or address not available');
            return;
        }
        // 使用 viem 创建公共客户端
        const publicClient = createPublicClient({
            chain: sepolia,
            transport: window.ethereum,
        });
        // 合约信息
        const erc20Address = '0x56b9d2cf44789d9626593a3cd3b75bff9e6a64a0'; // 替换为实际的 ERC20 合约地址
        const erc20Abi = [
            {
                constant: true,
                inputs: [{ name: '_owner', type: 'address' }],
                name: 'balanceOf',
                outputs: [{ name: 'balance', type: 'uint256' }],
                type: 'function',
            },
        ];
        // 获取合约实例
        const contract = getContract({
            address: erc20Address,
            abi: erc20Abi,
            client: publicClient,
        });
        // 调用合约方法
        const result = await contract.read.balanceOf([address]);
        setBalance(formatEther(result as bigint));
    };

    return (
        <div>
            <h1>MetaMask 钱包连接</h1>
            {isConnected ? (
                <div>
                    <p>已连接: {address}</p>
                    <button onClick={() => disconnect()}>断开连接</button>
                    <button onClick={handleReadBalance}>读取余额</button>
                    {balance && <p>余额: {balance} ETH</p>}
                </div>
            ) : (
                <div>
                    {connectors.map((connector) => (
                        <button key={connector.id} onClick={() => connect({ connector })}>
                            连接 {connector.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default App;
