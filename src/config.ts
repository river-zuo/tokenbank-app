import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors'

const sepoliaRpcUrl = import.meta.env.SEPOLIA_RPC_URL;

const projectId = '<WALLETCONNECT_PROJECT_ID>'

export const config_old = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    // injected(),
    metaMask(),
    // safe(),
    // walletConnect({ projectId }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    metaMask(),
  ],
  transports: {
    [sepolia.id]: http(sepoliaRpcUrl),
  },
})
