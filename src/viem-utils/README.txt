# 使⽤ Viem.sh 监听 NFTMarket 的买卖记录
- events.ts 文件

```
npx ts-node src/viem-utils/events

NftOnList events: [
  {
    eventName: 'NftOnList',
    args: {
      tokenId: 100n,
      seller: '0x4251BA8F521CE6bAe071b48FC4621baF621057c5',
      price: 500n
    },
    removed: false,
    logIndex: 51,
    transactionIndex: 33,
    transactionHash: '0x5fd8d9cf792eb9244de5cd20f5ae1d4717c708f4b7533573f7e10b7a5dd10b74',
    blockHash: '0x55ee530076740606644be92bfade185f9cc1e324118b09e0ae048d53435076bf',
    blockNumber: 8305720n,
    address: '0xead2b7ad2644bee5456b4dac3e1d0541e0cfbf2a',
    data: '0x00000000000000000000000000000000000000000000000000000000000000640000000000000000000000004251ba8f521ce6bae071b48fc4621baf621057c500000000000000000000000000000000000000000000000000000000000001f4',
    topics: [
      '0xfa118b6e4c62103d06c4eaafc85f058eca96784d5d3781f2c7a8c36ba128a93f'
    ]
  }
]
Transfer_NFT events: [
  {
    eventName: 'Transfer_NFT',
    args: {
      from: '0x4251BA8F521CE6bAe071b48FC4621baF621057c5',
      to: '0xF764526cc27473A0bebFb228e8757879D4763802',
      tokenId: 100n
    },
    removed: false,
    logIndex: 46,
    transactionIndex: 27,
    transactionHash: '0x4dcbbbb293f36ba12ba31f997c9ca900991c9e5419ea23c8002e95fdb9c39547',
    blockHash: '0xc0d1602f6992f6ad593ec86c807b02381278e5d1e265ef51fed3bb52126f2fcd',
    blockNumber: 8305792n,
    address: '0xead2b7ad2644bee5456b4dac3e1d0541e0cfbf2a',
    data: '0x0000000000000000000000004251ba8f521ce6bae071b48fc4621baf621057c5000000000000000000000000f764526cc27473a0bebfb228e8757879d47638020000000000000000000000000000000000000000000000000000000000000064',
    topics: [
      '0xdbee53ac1b755eda5db14f08cae6a5b4f1357b5dea328471bc347ead64d14cde'
    ]
  }
]
NFT_Received events: []
NFT上架_logs: [
  {
    eventName: 'NftOnList',
    args: {
      tokenId: 100n,
      seller: '0xF764526cc27473A0bebFb228e8757879D4763802',
      price: 600n
    },
    removed: false,
    logIndex: 24,
    transactionIndex: 18,
    transactionHash: '0x88dc6ae8b39b11fd147e15ddfbf99accb086a0e1526ff4b50b81056df0e24169',
    blockHash: '0xd6689d6d666d73988c5fa8da432b0c67fc713fac81b3f8ecc5a51c5a2ce55083',
    blockNumber: 8305833n,
    address: '0xead2b7ad2644bee5456b4dac3e1d0541e0cfbf2a',
    data: '0x0000000000000000000000000000000000000000000000000000000000000064000000000000000000000000f764526cc27473a0bebfb228e8757879d47638020000000000000000000000000000000000000000000000000000000000000258',
    topics: [
      '0xfa118b6e4c62103d06c4eaafc85f058eca96784d5d3781f2c7a8c36ba128a93f'
    ]
  }
]
NFT卖出_logs: [
  {
    eventName: 'NFT_Received',
    args: {
      from: '0xF764526cc27473A0bebFb228e8757879D4763802',
      to: '0xF764526cc27473A0bebFb228e8757879D4763802',
      tokenId: 100n
    },
    removed: false,
    logIndex: 78,
    transactionIndex: 36,
    transactionHash: '0x3d3ebf9faaa21668a4013982b854048851c4fb4bb8a3acf9ac0aef03f32dd4a8',
    blockHash: '0x63779b60fddb81c174e71a7e570f25f128d6fb08a68ee4201523f76481bd8316',
    blockNumber: 8305843n,
    address: '0xead2b7ad2644bee5456b4dac3e1d0541e0cfbf2a',
    data: '0x000000000000000000000000f764526cc27473a0bebfb228e8757879d4763802000000000000000000000000f764526cc27473a0bebfb228e8757879d47638020000000000000000000000000000000000000000000000000000000000000064',
    topics: [
      '0xae19097b6845c8ee7b2da4763c28586eaacff48ef9c03606e5a56575c364a8f9'
    ]
  }
]
```
