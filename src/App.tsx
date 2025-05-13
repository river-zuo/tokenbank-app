import React, { useState } from 'react';
import './App.css'
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import { useAccount, WagmiProvider } from 'wagmi'
import { useAccount } from 'wagmi'
// import { config } from './config'
// import { Profile } from './profile'
import { Account } from './account'
import { WalletOptions } from './wallet-options'
import { ReadContract } from './rw-contract/read-contract'
import { WriteContract } from './rw-contract/write-contract'
import { ReadTokenBankContract } from './rw-contract/read-bank-contract'
import { WriteSaveBankContract } from './rw-contract/write-bank-save-contract'
import { WriteApproveBankContract } from './rw-contract/write-bank-approve-contract'
import { ReadTokenBankApproveContract } from './rw-contract/read-bank-approve-contract'
import { WriteWithdrawBankContract } from './rw-contract/write-bank-withdraw-contract'
import { AppKitProvider } from './appkitProvider'
import AppkitDemo from './appkitDemoContent'
import NftOnList from './rw-contract/nft-onlist'
import NftHasOnList from './rw-contract/nft-list'

// const queryClient = new QueryClient()

function ConnectWallet() {
    const { isConnected } = useAccount()
    if (isConnected) return <Account />
    return <WalletOptions />
}

const App: React.FC = () => {
    return (
        // <WagmiProvider config={config}>
        //     <QueryClientProvider client={queryClient}>
        //         <ConnectWallet />
        //         <div>
        //             <h3>个人账户</h3>
        //             <WriteContract />
        //             <ReadContract />
        //             <h2>银行账户</h2>
        //             <WriteApproveBankContract />
        //             <ReadTokenBankApproveContract />
        //             <WriteSaveBankContract />
        //             <ReadTokenBankContract />
        //             <WriteWithdrawBankContract />
        //         </div>
        //     </QueryClientProvider>
        // </WagmiProvider>
        <AppKitProvider>
            <AppkitDemo />
            <hr />
            <NftHasOnList/>
            <hr />
            <ReadContract />
            <NftOnList/>
            {/* <h3>个人账户</h3>
            <WriteContract />
            <ReadContract />
            <h2>银行账户</h2>
            <WriteApproveBankContract />
            <ReadTokenBankApproveContract />
            <WriteSaveBankContract />
            <ReadTokenBankContract />
            <WriteWithdrawBankContract /> */}
        </AppKitProvider>
    );
};

export default App;