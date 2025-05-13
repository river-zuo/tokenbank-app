import * as React from 'react'
import { type BaseError, useWaitForTransactionReceipt, useWriteContract, useReadContract } from 'wagmi'
import { abi as BaseERC20_abi } from '../../artifacts/BaseERC20.json'
import { abi as TokenBankV2_abi } from '../../artifacts/TokenBankV2.json'
import { abi as NftMarket_abi } from '../../artifacts/NFTMarket.json'
import { abi as Nft_abi } from '../../artifacts/MyNFT.json'

const erc20_address = "0x56b9d2cf44789d9626593a3cd3b75bff9e6a64a0";
const bank_address = "0x0d1ac1a9a830904b6b447f82785e67b377ec1ecb";

const nft_address = "0x3425C9B618c0518470a936ee36e90ea78123aC83";
const nft_market_address = "0xe20fE51E8161F1F5b77E3252F91Afe1dcd30fC3c";

/*
nft_market
nft   0x3425C9B618c0518470a936ee36e90ea78123aC83
erc20 0x56b9D2Cf44789D9626593A3CD3b75BFf9E6a64a0
*/
export function NftOnList() {
    const { data: hash, error, writeContract, isPending, } = useWriteContract()
    // 授权
    async function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        const amount = formData.get('tokenId') as string
        writeContract({
            address: nft_address,
            abi: Nft_abi,
            functionName: 'approve',
            args: [nft_market_address, BigInt(amount)],
        })
    };
    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
            hash,
        });

    // 上架
    const { data: nft_hash, error: nft_error,
        writeContract: nft_writeContract, isPending: nft_isPending, } = useWriteContract()
    async function onList(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        const tokenId = formData.get('tokenId') as string
        const amount = formData.get('amount') as string
        nft_writeContract({
            address: nft_market_address,
            abi: NftMarket_abi,
            functionName: 'list',
            args: [BigInt(tokenId), BigInt(amount)],
        })
    }
    const { isLoading: nft_isConfirming, isSuccess: nft_isConfirmed } =
        useWaitForTransactionReceipt({
            hash: nft_hash,
        });

    // 购买nft
    const { data: buy_hash, error: buy_error,
        writeContract: buy_writeContract, isPending: buy_isPending, } = useWriteContract()
    async function onBuy(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        const tokenId = formData.get('tokenId') as string
        const amount = formData.get('amount') as string
        buy_writeContract({
            address: erc20_address,
            abi: BaseERC20_abi,
            functionName: 'transferWithCallback',
            args: [nft_market_address, BigInt(amount), BigInt(tokenId)],
        })
    }
    const { isLoading: buy_isConfirming, isSuccess: buy_isConfirmed } =
        useWaitForTransactionReceipt({
            hash: buy_hash,
        });
    // // 读取NFT所属账户
    // const {
    //     data,
    //     error,
    //     isPending } = useReadContract({
    //         address: nft_address,
    //         abi: Nft_abi,
    //         functionName: 'ownerOf',
    //         args: [tokenId],
    //     })

    // const [nftOwner, setNftOwner] = React.useState<string | null>(null);
    // const [loading, setLoading] = React.useState(false);
    // const [owner_error, setError] = React.useState<string | null>(null);

    // async function getNftOwner(e: React.FormEvent<HTMLFormElement>) {
    //     e.preventDefault()
    //     setLoading(true);
    //     setError(null);
    //     setNftOwner(null);

    //     const formData = new FormData(e.target as HTMLFormElement)
    //     const tokenId = formData.get('tokenId') as string
    //     try {
    //         const {
    //             data,
    //             error,
    //             isPending } = useReadContract({
    //                 address: nft_address,
    //                 abi: Nft_abi,
    //                 functionName: 'ownerOf',
    //                 args: [tokenId],
    //             })
    //         if (data) {
    //             setNftOwner(data as string);
    //         } else {
    //             setError('未找到该 NFT 的所有者');
    //         }
    //     } catch (err: any) {
    //         setError(err.message || '获取 NFT 所有者失败');
    //     } finally {
    //         setLoading(false);
    //     }
    // }


    return (
        <div>
            <form onSubmit={submit}>
                <input name="tokenId" type="number" placeholder="NFT编号" required />
                <button disabled={isPending} type="submit"> {isPending ? '正在授权...' : '授权操作NFT'}</button>
                {hash && <div>Transaction Hash: {hash}</div>}
                {isConfirming && <div>Waiting for confirmation...</div>}
                {isConfirmed && <div>Transaction confirmed.</div>}
                {error && (
                    <div>Error: {(error as BaseError).shortMessage || error.message}</div>
                )}
            </form>
            <form onSubmit={onList}>
                <input name="tokenId" type="number" placeholder="NFT编号" required />
                <input name="amount" type="number" placeholder="价格" required />
                <button disabled={nft_isPending} type="submit"> {nft_isPending ? '正在上架...' : '上架NFT'}</button>
                {nft_hash && <div>Transaction Hash: {hash}</div>}
                {nft_isConfirming && <div>Waiting for confirmation...</div>}
                {nft_isConfirmed && <div>Transaction confirmed.</div>}
                {nft_error && (
                    <div>Error: {(error as BaseError).shortMessage || nft_error.message}</div>
                )}
            </form>
            <form onSubmit={onBuy}>
                <input name="amount" type="number" placeholder="金额" required />
                <input name="tokenId" type="number" placeholder="NFT编号" required />
                <button disabled={buy_isPending} type="submit"> {buy_isPending ? '正在上架...' : '购买nft'}</button>
                {buy_hash && <div>Transaction Hash: {hash}</div>}
                {buy_isConfirming && <div>Waiting for confirmation...</div>}
                {buy_isConfirmed && <div>Transaction confirmed.</div>}
                {buy_error && (
                    <div>Error: {(error as BaseError).shortMessage || buy_error.message}</div>
                )}
            </form>
            {/* <form onSubmit={getNftOwner}>
                <input name="tokenId" type="number" placeholder="NFT编号" required />
                <button disabled={buy_isPending} type="submit"> {buy_isPending ? '正在上架...' : '购买nft'}</button>
                {buy_hash && <div>Transaction Hash: {hash}</div>}
                {buy_isConfirming && <div>Waiting for confirmation...</div>}
                {buy_isConfirmed && <div>Transaction confirmed.</div>}
                {buy_error && (
                    <div>Error: {(error as BaseError).shortMessage || buy_error.message}</div>
                )}
            </form> */}
        </div>

    )
}

export default NftOnList;
