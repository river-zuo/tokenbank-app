- flashbots_getBundleStats 对本次捆绑的返回信息
```
Bundle stats: {
  isHighPriority: true,
  isSentToMiners: false,
  isSimulated: true,
  simulatedAt: '2025-06-03T12:38:28.113Z',
  submittedAt: '2025-06-03T12:38:28.109Z'
}
```
- 最终提交到 sepolia 网络的 enablePresale 和 presale 交易哈希
```
0x7b46e68ab8c42f3f4cd74423f57c5de8f76fd8d01c0bd738b6af83c772b3f0d6
0xd5e4d3059a312acb948e7a8038e308f31a715c0b73b7d497e6d8601f79e02781
交易hash没有真正提交到sepolia给矿工进行打包

sendRawBundle 返回结果: 
{
  "bundleTransactions": [
    {
      "signedTransaction": "0x02f87083aa36a72b830f4240830f4278830186a094954a3c97bad1e7085d645863a88d9ce082bae80b8084a8eac492c080a0c710737d87ff8e9bc3ac6f33afa51c7f88225cbd9d8863a3a7478629ffb8507aa020e27e3d3eeba3619e0f833fa66b6bea7acb4c9a43dec5e380446310891e1ecd",
      "hash": "0x7b46e68ab8c42f3f4cd74423f57c5de8f76fd8d01c0bd738b6af83c772b3f0d6",
      "account": "0xF764526cc27473A0bebFb228e8757879D4763802",
      "nonce": 43
    },
    {
      "signedTransaction": "0x02f89783aa36a703830f4240830f4278830186a094954a3c97bad1e7085d645863a88d9ce082bae80b872386f26fc10000a4e6ab14340000000000000000000000000000000000000000000000000000000000000001c001a0861008dfa10186c7ffe89d16a557365e1af72a3a8b614eae3d673e2301ee9d37a057cdae33d179243325e07b782ea33123c6e86abeb255a5e0c9a1c3aa8e970577",
      "hash": "0xd5e4d3059a312acb948e7a8038e308f31a715c0b73b7d497e6d8601f79e02781",
      "account": "0xCe83B9f23a42BE415f9e26abFcaE696F3D970267",
      "nonce": 3
    }
  ],
  "bundleHash": "0x8d8189525fe580c6cc666aae7613fc5ec9b442123ff2fc083ed2fa3824a7dd8a"
}
```