# 链接转换工具

一个专业的链接转换工具，支持将淘宝、支付宝、天猫、京东等平台的链接转换为 deeplink。

## 功能特性

- 🛒 支持多平台：淘宝、支付宝、天猫、京东
- 🔗 短链接转 deeplink
- 📱 H5 链接转 deeplink
- 📋 批量转换：支持一次转换多个链接
- 📋 一键复制：转换结果可一键复制到剪贴板
- 🎨 现代化 UI：基于 Tailwind CSS 的简洁美观界面

## 技术栈

- **框架**: Next.js 14
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **部署**: 支持 Vercel 等平台

## 快速开始

1. 安装依赖：

```bash
npm install
```

2. 启动开发服务器：

```bash
npm run dev
```

3. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 构建部署

```bash
npm run build
npm start
```

## 项目结构

```
├── app/
│   ├── globals.css      # 全局样式
│   ├── layout.tsx       # 根布局
│   └── page.tsx         # 主页面
├── package.json         # 项目配置
├── tailwind.config.js   # Tailwind配置
├── tsconfig.json        # TypeScript配置
└── next.config.js       # Next.js配置
```

## 使用说明

1. 在文本框中输入需要转换的链接（支持批量，一行一个）
2. 选择转换类型：短链接转 deeplink 或 H5 链接转 deeplink
3. 点击"获取链接"按钮开始转换
4. 查看转换结果，可点击复制按钮复制转换后的链接

## 支持的链接格式

- **淘宝**: `https://item.taobao.com/item.htm?id=xxx`
- **支付宝**: `https://m.alipay.com/xxx`
- **天猫**: `https://detail.tmall.com/item.htm?id=xxx`
- **京东**: `https://item.jd.com/xxx`

## 注意事项

- 转换功能基于各平台的 deeplink 协议
- 部分链接可能需要根据实际平台规则进行调整
- 建议在移动设备上测试转换后的链接效果
