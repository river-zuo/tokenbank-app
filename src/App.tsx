import React, { useState } from 'react';
import './App.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAccount, WagmiProvider } from 'wagmi'
import { config } from './config'
import { Profile } from './profile'
import { Account } from './account'
import { WalletOptions } from './wallet-options'
import { ReadContract } from './rw-contract/read-contract'
import { WriteContract } from './rw-contract/write-contract'
import { ReadTokenBankContract } from './rw-contract/read-bank-contract'
import { WriteSaveBankContract } from './rw-contract/write-bank-save-contract'
import { WriteApproveBankContract } from './rw-contract/write-bank-approve-contract'
import { ReadTokenBankApproveContract } from './rw-contract/read-bank-approve-contract'
import { WriteWithdrawBankContract } from './rw-contract/write-bank-withdraw-contract'
import { EIP7702WriteApproveBankContract } from './eip7702/EIP7702-write-and-approve-contract'
import SiwePage from './siwe/page'
import {PermitBuyWithSign} from './rw-contract/permitbuy-with-sign';
import TransferList from './get-logs/TransferList';
import GetLogs from './get-logs/getlogs';

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
                {/* <GetLogs /> */}
                {/* <Profile /> */}
                <div>
                    <h3>授权并转账</h3>
                    <EIP7702WriteApproveBankContract />
                    <ReadContract />
                    <ReadTokenBankContract />
                    {/* <hr />
                    <h3>个人账户</h3>
                    <WriteContract />
                    <ReadContract />
                    <h2>银行账户</h2>
                    <WriteApproveBankContract />
                    <ReadTokenBankApproveContract />
                    <WriteSaveBankContract />
                    <ReadTokenBankContract />
                    <WriteWithdrawBankContract /> */}
                    {/* <hr />
                     <SiwePage />
                    <PermitBuyWithSign/> */}
                </div>
            </QueryClientProvider>
        </WagmiProvider>
    );
};

export default App;