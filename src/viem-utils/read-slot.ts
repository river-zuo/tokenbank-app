import { createPublicClient, formatEther, Hex, http, keccak256, hexToBigInt } from 'viem'
import { mainnet, sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import dotenv from 'dotenv'
dotenv.config()

const addr_in_sepolia = "0x4D22637234E3E8437c2006B4EEbB4d63Ac85aA3D";
// const addr_in_sepolia = "0x0ecAD1C39B3860B369aC952f8818470ED568660e";
;
(async () => {
    const client = createPublicClient({
        chain: sepolia,
        transport: http(process.env.SEPOLIA_RPC_URL),
    });
    // let idx: bigint = calculateDynamicArrayElementSlot(BigInt(0), 0);
    // console.log(idx);
    // idx = idx + BigInt(1);
    // const data = await client.getStorageAt({
    //     address: addr_in_sepolia as Hex,
    //     // slot: `0x${Buffer.alloc(32).toString('hex')}`,
    //     slot: `0x${idx.toString(16)}` as Hex,
    // });
    // console.log(data);

    // struct LockInfo{
    //     address user;
    //     uint64 startTime; 
    //     uint256 amount;
    // }
// user_startTime:  0x0000000000000000d05613c80000000000000000000000000000000000000001
// user_startTime:  0x0000000000000000000000000000000000000000000000000de0b6b3a7640000
// user_startTime:  0x0000000000000000d05613c70000000000000000000000000000000000000002
// user_startTime:  0x0000000000000000000000000000000000000000000000001bc16d674ec80000
// user_startTime:  0x0000000000000000d05613c60000000000000000000000000000000000000003
// user_startTime:  0x00000000000000000000000000000000000000000000000029a2241af62c0000

    for (let i = 0; i < 11; i ++) {
        // 计算存储slot位置
        const base_slot = 0n;
        const slot_user_startTime: bigint = calculateDynamicArrayElementSlot(base_slot, i * 2);
        const slot_amount: bigint = calculateDynamicArrayElementSlot(base_slot, i * 2 + 1);
        const data_user_startTime = await client.getStorageAt({
            address: addr_in_sepolia as Hex,
            slot: `0x${slot_user_startTime.toString(16)}` as Hex,
        });
        // 0x0000000000000000d05613c80000000000000000000000000000000000000001
        const data_user_startTime_str = data_user_startTime as String;
        const data_user_startTime_hex = data_user_startTime_str.replaceAll("0x", "");
        // console.log("user_startTime: ", data_user_startTime_hex);
        // console.log("user_startTime: ", typeof data_user_startTime);
        const data_user = `0x${data_user_startTime_hex.slice(24, 64).toLowerCase()}`;
        const data_startTime = parseInt(data_user_startTime_hex.slice(0, 24), 16);

        const data_amount = await client.getStorageAt({
            address: addr_in_sepolia as Hex,
            // slot: `0x${Buffer.alloc(32).toString('hex')}`,
            slot: `0x${slot_amount.toString(16)}` as Hex,
        });
        const amount = hexToBigInt(data_amount as Hex);
        console.log(`locks[${i}]:user: ${hexToBigInt(data_user as Hex)}, startTime: ${data_startTime}, amount:${amount}`);
    }
})();

function calculateDynamicArrayElementSlot(baseSlot: bigint, index: number): bigint {
    // 将 baseSlot 编码为 32 字节大端序
    const baseSlotBuffer = Buffer.alloc(32);
    baseSlotBuffer.writeBigUInt64BE(BigInt(baseSlot), 24); // 从偏移量 24 写入

    // 计算 keccak256(baseSlot)
    const hashOfBaseSlot = keccak256(baseSlotBuffer);

    // 将 index 编码为 32 字节大端序
    const indexBuffer = Buffer.alloc(32);
    indexBuffer.writeUInt32BE(index, 28); // 从偏移量 28 写入

    // 计算最终的槽位：keccak256(baseSlot) + index
    const finalSlot = BigInt(hashOfBaseSlot) + BigInt(index);

    return finalSlot;
}
