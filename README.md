# liushi-monitor

前端性能监控sdk及数据与用户行为分析平台

# 环境要求

- `pnpm`: ^10
- `node`: ^18
- `https`: 由于token放在cookie中，受限于Chorme新版本中, sameSite=none;secure=false 配置只会在https环境下生效, 故需要接入自己的证书开启https运行前后端

# 运行指令

根目录下调用以下指令启动项目

```bash
# 运行sdk
pnpm run dev:sdk

# 运行后端服务器
pnpm run dev:serevr

# 运行分析平台
pnpm run dev:platform
```

# 自定义用户行为收集的事件命名规范参考

适用于监控组件中的自定义埋点

参见: [产品分析的简单事件命名约定](https://www.wudpecker.io/blog/simple-event-naming-conventions-for-product-analytics?utm_source=chatgpt.com)
