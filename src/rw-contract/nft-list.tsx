import { type BaseError, useReadContract, useReadContracts, useAccount } from 'wagmi'
// import { wagmiContractConfig } from './contracts'
// import { abi as BaseERC20_abi } from '@artifacts/BaseERC20.json'
import { abi as BaseERC20_abi } from '../../artifacts/BaseERC20.json'
import { abi as TokenBankV2_abi } from '../../artifacts/TokenBankV2.json'
import { abi as NftMarket_abi } from '../../artifacts/NFTMarket.json'
import { abi as Nft_abi } from '../../artifacts/MyNFT.json'

const erc20_address = "0x56b9d2cf44789d9626593a3cd3b75bff9e6a64a0";
const bank_address = "0x0d1ac1a9a830904b6b447f82785e67b377ec1ecb";

const nft_address = "0x3425C9B618c0518470a936ee36e90ea78123aC83";
const nft_market_address = "0xe20fE51E8161F1F5b77E3252F91Afe1dcd30fC3c";
export function NftHasOnList() {
    const { isConnected, address: AccountAddr } = useAccount()
    const {
        data: nftList,
        error,
        isPending } = useReadContract({
            address: nft_market_address,
            abi: NftMarket_abi,
            functionName: 'nftList',
        })
    // console.log("nftList", nftList)
    // console.log("nftList", nftList[0])
    if (!isConnected) return <div>NFT上架列表: 请连接钱包</div>
    if (isPending) return <div>NFT上架列表: Loading...</div>
    if (error) {
        // 安全地处理错误信息
        const errorMessage = (error as unknown as BaseError)?.shortMessage
            || error.message
            || 'Unknown error occurred';
        return <div>Error: {errorMessage}</div>
    }
    return (
        <div>NFT上架列表:
            <table border={1} cellPadding={8} cellSpacing={0} style={{ width: '60%', margin: 'auto', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f2f2f2' }}>
                        <th>NFT编号</th>
                        <th>价格</th>
                        <th>所有者</th>
                    </tr>
                </thead>
                <tbody>
                    {nftList.filter(nft => nft.id != 0).map((nft) => (
                        <tr key={nft.id}>
                            <td>{nft.id}</td>
                            <td>{nft.price}</td>
                            <td>{nft.owner}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default NftHasOnList;