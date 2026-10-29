# 縦組工房 · Tategaki Studio

一个在浏览器中完成的日文/中文竖排工具。输入横排文本后，可实时预览从上到下、从右到左的竖排版，并复制或下载等宽纯文本结果。

## 功能

- 浏览器原生 `writing-mode: vertical-rl` 视觉预览
- 生成可复制的纯文本字符网格
- 自定义每列字数、字号和列间距
- 自动转换句读点、引号、括号等竖排标点
- 使用 `Intl.Segmenter` 按字素切分，不拆散 emoji 和组合字符
- 导入 `.txt`、复制结果、下载 `.txt`
- 自动保存当前原文；全部处理均在本地浏览器完成
- 响应式桌面与移动端界面

## 本地开发

```bash
npm install
npm run dev
```

打开终端显示的本地地址即可。

## 验证与构建

```bash
npm test
npm run lint
npm run build
```

生产文件输出到 `dist/`。推送到 `main` 后，GitHub Actions 会自动构建并发布 GitHub Pages。

## 排版算法

1. 用 Unicode 字素边界切分输入，保证一个视觉字符不会被拆开。
2. 按需要将横排标点映射为 Unicode 竖排形式。
3. 按“一列的文字数”从上到下分列。
4. 反转列顺序，得到从右到左的阅读顺序。
5. 对不足的列补全全角空格，逐行输出可复制的纯文本。

## 技术栈

React 19、TypeScript、Vite、Vitest。无后端、无数据上传。

## License

MIT
