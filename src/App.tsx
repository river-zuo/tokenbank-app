import React from 'react';
import './App.css'
import { ReadContract } from './rw-contract/read-contract'
import { AppKitProvider } from './appkitProvider'
import AppkitDemo from './appkitDemoContent'
import NftOnList from './rw-contract/nft-onlist'
import NftHasOnList from './rw-contract/nft-list'

const App: React.FC = () => {
    return (
        <AppKitProvider>
            <AppkitDemo />
            <hr />
            <NftHasOnList />
            <hr />
            <ReadContract />
            <NftOnList />
        </AppKitProvider>
    );
};

export default App;