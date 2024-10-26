const fs = require("fs");
const path = require("path");

const markdownToHtml = (markdown) => {
  let id = 0;
  const paragraphs = markdown
  .split(/\r?\n/g);
  let html = "";
  let paragraphContent = "";
  let inCodeFlag
  for(const paragraph of paragraphs){
    let processed = paragraph;
    if(/^```/.test(processed)){
      processed = inCodeFlag ? `</code></pre>` : `<pre><code>`;
      inCodeFlag = !inCodeFlag;
    }else{
    processed = processed
    .replace(/^# (.*$)/, (_, text) => {
      id++;
      return `<h2 id="${id}">${text}</h2>`;
    })
    .replace(/^## (.*$)/, (_, text) => {
      id++;
      return `<h3 id="${id}">${text}</h3>`;
    })
    .replace(/^#{3,} (.*$)/, (_, text) => {
      return `<h4>${text}</h4>`;
    })
    .replace(/\[(.*?)\]\((.*?)\)/g, (_, text, url) => {
      return `<a href="${url}">${text}</a>`
    })
    .replace(/^> (.*)/gm, (_, text) => {return `<blockquote>${text}</blockquote>`})
    .replace(/`([^`]+?)`/g, (_, text) => {return `<code>${text}</code>`})
    .replace(/ {2,}$/, "<br>");
  }
  if(/^</.test(processed) || inCodeFlag){
    if (paragraphContent) {
      html += `<p>${paragraphContent.trim()}</p>`;
      paragraphContent = "";
    }
    html += processed;
  } else {
    paragraphContent += processed;
  }
  }
  if(paragraphContent){
    html += `<p>${paragraphContent.trim()}</p>`;
  }
  return html;
}

const buildArticle = async (filePath) => {
  const content = await fs.promises.readFile(filePath, "utf-8");
  const fileName = path.basename(filePath, ".md") + ".html";
  const outputPath = path.join(__dirname, "../article", fileName);
  const htmlContent = markdownToHtml(content);
  const config = await fs.promises.readFile(filePath.replace(".md", ".json"), "utf-8");
  const configs = JSON.parse(config);
  const title = configs.title || "";
  console.log(configs);

  const html = `
    <html>
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="description" content="">
          <link rel="shortcut icon" href="/public/img/png/favicon.png" type="image/x-icon">
          <link rel="stylesheet" href="/public/css/common.css">
          <script src="/public/js/common.js" defer></script>
          <title>${title}</title>
      </head>
      <body>
        <header></header>
        <main>
          <h1 id="title">${title}</h1>
          <div id="content">${htmlContent}</div>
        </main>
        <footer></footer>
      </body>
    </html>`;
  await fs.promises.writeFile(outputPath, html, "utf-8");
  console.log("built article!");
};

const buildSite = async () => {
  try {
    const articlesDir = path.join(__dirname, "../article/articles");
    const articles = await fs.promises.readdir(articlesDir);

    const tasks = articles
      .filter((file) => file.endsWith(".md"))
      .map((file) => buildArticle(path.join(articlesDir, file)));

    await Promise.all(tasks);
    console.log("全てのビルドが完了しました！");
  } catch (err) {
    console.error("エラー:", err);
  }
};

buildSite();
