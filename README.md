# obsidian-to-rich

把 Obsidian Markdown 一键转换成可直接打开/复制的 HTML。

## 安装

```bash
npm install
```

## 一条命令转换

```bash
node index.js path/to/note.md
```

默认会在项目根目录的 `outputs/` 下生成同名 HTML（例如 `outputs/note.html`）。

## 默认转换规则

- 去掉 YAML frontmatter
- 去掉文档开头的一级标题（H1）
- 普通正文行之间自动补空行（code block 内不补）
- 支持 Obsidian 图片嵌入语法 `![[image.png]]`
- 默认从文档同级的 `attachments/` 目录找图片并转成 base64

## 可选参数

```bash
Usage: obsidian-to-rich [options] [input]

Arguments:
  input                                输入的 Obsidian Markdown 文件路径

Options:
  -V, --version                        显示版本号
  -t, --theme <theme>                  主题名称 (默认: wechat-default)
  -i, --inline-only                    只输出内联 HTML（无 DOCTYPE/html/body）
  -s, --sanitize                       清理 HTML 属性，增强兼容性
  -a, --attachments-dir <dir>          图片目录名（默认: attachments）
  --keep-frontmatter                   保留 frontmatter
  --keep-title                         保留开头 H1 标题
  --no-paragraph-spacing               关闭正文自动补空行
  -l, --list-themes                    列出所有主题
  -h, --help                           显示帮助
```

## 示例

```bash
# 默认规则转换
node index.js ./vault/article.md

# attachments 目录名不是默认值时
node index.js ./vault/article.md -a _assets
```

## 主题

```bash
node index.js themes
```
