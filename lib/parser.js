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
    // 为代码块添加包装器，便于样式控制
    return `<section class="code-wrapper">${html}</section>`;
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
