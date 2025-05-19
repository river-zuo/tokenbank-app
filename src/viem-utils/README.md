- 读取solt代码
read-slot.ts
- 运行日志
```
locks[0]:user: 1, startTime: 3495302088, amount:1000000000000000000
locks[1]:user: 2, startTime: 3495302087, amount:2000000000000000000
locks[2]:user: 3, startTime: 3495302086, amount:3000000000000000000
locks[3]:user: 4, startTime: 3495302085, amount:4000000000000000000
locks[4]:user: 5, startTime: 3495302084, amount:5000000000000000000
locks[5]:user: 6, startTime: 3495302083, amount:6000000000000000000
locks[6]:user: 7, startTime: 3495302082, amount:7000000000000000000
locks[7]:user: 8, startTime: 3495302081, amount:8000000000000000000
locks[8]:user: 9, startTime: 3495302080, amount:9000000000000000000
locks[9]:user: 10, startTime: 3495302079, amount:10000000000000000000
locks[10]:user: 11, startTime: 3495302078, amount:11000000000000000000
```
- 描述
```
题目#1
使用Viem 利用 getStorageAt 从链上读取 _locks 数组中的所有元素值，并打印出如下内容：
locks[0]: user:…… ,startTime:……,amount:……
```
```
contract esRNT {
    struct LockInfo{
        address user;
        uint64 startTime; 
        uint256 amount;
    }
    LockInfo[] private _locks;

    constructor() { 
        for (uint256 i = 0; i < 11; i++) {
            _locks.push(LockInfo(address(uint160(I+1)), uint64(block.timestamp*2-i), 1e18*(i+1)));
        }
    }
}
```
