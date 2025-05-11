import { type BaseError, useReadContract, useReadContracts, useAccount } from 'wagmi'
// import { wagmiContractConfig } from './contracts'
// import { abi as BaseERC20_abi } from '@artifacts/BaseERC20.json'
import { abi as BaseERC20_abi } from '../../artifacts/BaseERC20.json'
import { abi as TokenBankV2_abi } from '../../artifacts/TokenBankV2.json'

const erc20_address = "0x56b9d2cf44789d9626593a3cd3b75bff9e6a64a0";
const bank_address = "0x0d1ac1a9a830904b6b447f82785e67b377ec1ecb";
export function ReadTokenBankApproveContract() {
    const { isConnected, address: AccountAddr } = useAccount()
    const {
        data: balance,
        error,
        isPending } = useReadContract({
            address: erc20_address,
            abi: BaseERC20_abi,
            functionName: 'allowance',
            // args: ['0x03A71968491d55603FFe1b11A9e23eF013f75bCF'],
            args: [AccountAddr, bank_address],
            query: {
                enabled: !!AccountAddr,
            }
        })
    if (!isConnected) return <div>银行授权余额: 请连接钱包</div>
    if (isPending) return <div>银行授权余额: Loading...</div>
    if (error) {
        // 安全地处理错误信息
        const errorMessage = (error as unknown as BaseError)?.shortMessage
            || error.message
            || 'Unknown error occurred';
        return <div>Error: {errorMessage}</div>
    }
    return (
        <div>银行授权余额: {balance?.toString()}</div>
    )
}
