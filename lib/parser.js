import { marked } from 'marked';

/**
 * 配置 Markdown 解析器
 * 支持表格等扩展功能
 */
function configureMarked() {
  // 配置 marked 选项
  marked.setOptions({
    gfm: true,          // 启用 GitHub Flavored Markdown
    breaks: false,      // 不将单个换行符转换为 <br>
    pedantic: false,    // 不严格遵守原始 markdown.pl
    smartLists: true,   // 使用更智能的列表行为
    smartypants: false, // 不使用智能标点符号
  });

  // 自定义渲染器，优化微信公众号兼容性
  const renderer = new marked.Renderer();

  // 自定义代码块渲染
  const originalCode = renderer.code.bind(renderer);
  renderer.code = function(code, language) {
    const html = originalCode(code, language);

    // 微信编辑器兼容性修复：将每一行代码用 <div> 标签包裹
    // 微信编辑器会移除 <br> 标签，但会保留 <div> 这样的块级元素
    const fixedHtml = html.replace(/<code([^>]*)>([\s\S]*?)<\/code>/g, (match, attrs, codeContent) => {
      // 将代码按行分割，每行用 <div> 包裹
      let lines = codeContent.split('\n');

      // 移除尾部的空行（split 在最后一个 \n 后会产生空字符串）
      if (lines.length > 0 && lines[lines.length - 1].trim() === '') {
        lines = lines.slice(0, -1);
      }

      const wrappedLines = lines.map(line => {
        // 如果整行是空的，用 &nbsp; 占位
        if (line.trim() === '') {
          return `<div style="margin: 0; padding: 0;">&nbsp;</div>`;
        }

        // 将行首的空格转换为 &nbsp; 来保留缩进
        // 同时保留其他空格
        let displayLine = line.replace(/^ +/, match => '&nbsp;'.repeat(match.length));
        // 将行中的多个连续空格也转换为 &nbsp;
        displayLine = displayLine.replace(/  +/g, match => '&nbsp;'.repeat(match.length));

        return `<div style="margin: 0; padding: 0;">${displayLine}</div>`;
      }).join('');
      return `<code${attrs}>${wrappedLines}</code>`;
    });

    // 为代码块添加包装器，便于样式控制
    return `<section class="code-wrapper">${fixedHtml}</section>`;
  };

  // 自定义表格渲染
  const originalTable = renderer.table.bind(renderer);
  renderer.table = function(header, body) {
    const html = originalTable(header, body);
    // 为表格添加包装器，支持横向滚动
    return `<section class="table-wrapper">${html}</section>`;
  };

  // 自定义图片渲染，添加懒加载和错误处理
  const originalImage = renderer.image.bind(renderer);
  renderer.image = function(href, title, text) {
    let html = `<img src="${href}" alt="${text || ''}"`;
    if (title) {
      html += ` title="${title}"`;
    }
    html += ' />';
    return html;
  };

  // 自定义链接渲染
  const originalLink = renderer.link.bind(renderer);
  renderer.link = function(href, title, text) {
    let html = `<a href="${href}"`;
    if (title) {
      html += ` title="${title}"`;
    }
    html += `>${text}</a>`;
    return html;
  };

  marked.use({ renderer });
}

/**
 * 将 Markdown 转换为 HTML
 * @param {string} markdown - Markdown 内容
 * @returns {string} HTML 内容
 */
export function parseMarkdown(markdown) {
  configureMarked();

  // 解析 Markdown
  let html = marked.parse(markdown);

  // 包裹在容器中
  html = `<div class="markdown-body">${html}</div>`;

  return html;
}

/**
 * 提取 Markdown 中的图片路径
 * @param {string} markdown - Markdown 内容
 * @returns {Array<string>} 图片路径数组
 */
export function extractImages(markdown) {
  const imageRegex = /!\[.*?\]\((.*?)\)/g;
  const images = [];
  let match;

  while ((match = imageRegex.exec(markdown)) !== null) {
    images.push(match[1]);
  }

  return images;
}

/**
 * 检查是否为本地图片路径
 * @param {string} path - 图片路径
 * @returns {boolean}
 */
export function isLocalImage(path) {
  // 排除 http/https/data URL
  return !path.startsWith('http://') &&
         !path.startsWith('https://') &&
         !path.startsWith('data:');
}
