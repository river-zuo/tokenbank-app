import React, { useState } from 'react';
import './App.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAccount, WagmiProvider } from 'wagmi'
import { config } from './config'
import { Profile } from './profile'
import { Account } from './account'
import { WalletOptions } from './wallet-options'
import { ReadContract } from './rw-contract/read-contract'

const queryClient = new QueryClient()

function ConnectWallet() {
    const { isConnected } = useAccount()
    if (isConnected) return <Account />
    return <WalletOptions />
}
const App: React.FC = () => {

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <ConnectWallet />
                {/* <Profile /> */}
                <div>
                    <h1>Hello ~~~</h1>
                    <h1>Hello ~~~</h1>
                    <ReadContract/>
                </div>
            </QueryClientProvider>
        </WagmiProvider>
    );
};

export default App;