# 开发指南

## 环境要求

- Node.js 18.0.0 或更高版本
- npm 8.0.0 或更高版本
- Chrome 浏览器

## 开发环境设置

1. 安装 Node.js
   - 访问 [Node.js 官网](https://nodejs.org/)
   - 下载并安装最新的 LTS 版本

2. 克隆项目并安装依赖
   ```bash
   git clone <repository-url>
   cd quote-card-generator
   npm install
   ```

3. 生成图标资源
   ```bash
   npm run generate-icons
   ```

4. 开发模式
   ```bash
   npm run dev
   ```

5. 构建扩展
   ```bash
   npm run build
   ```
   或者生产环境构建:
   ```bash
   npm run build:prod
   ```

## 在 Chrome 中加载扩展

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目的 `dist` 目录

## 测试

1. 在任意网页中选择文本
2. 点击出现的浮动图标或使用右键菜单
3. 在弹出窗口中自定义卡片样式
4. 导出图片并验证结果

## 调试

- 点击扩展图标右键 -> 审查弹出内容 可以打开 DevTools
- 在 `chrome://extensions` 页面点击"背景页"可以调试 Service Worker
- 在网页中右键 -> 检查 可以调试 Content Script

## 注意事项

- 修改代码后需要重新构建扩展
- 如果修改了 manifest.json,需要在 Chrome 扩展页面重新加载扩展
- 开发时建议使用 `npm run watch` 命令,自动监听文件变化并重新构建 