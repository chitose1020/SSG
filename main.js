const fs = require("fs");
const path = require("path");

const markdownToHtml = (markdown) => {
  let id = 0;
  const toc = [];
  const paragraphs = markdown.split(/\n{2,}/g);
  let html = ""
  for(const paragraph of paragraphs){
  html += `${paragraph
  .replace(/^# (.*$)/gm, (_, text) => {
    toc.push({ id: `heading-${id + 1}`, text: text, el: "h2" });
    return `<h2 id="${++id}">${text}</h2>`;
  })
  .replace(/^## (.*$)/gm, (_, text) => {
    toc.push({ id: `heading-${id + 1}`, text: text, el: "h3" });
    return `<h3 id="${++id}">${text}</h3>`;
  })
  .replace(/\[(.*?)\]\((.*?)\)/g, (_, text, url) => {
    return `<a href="${url}">${text}</a>`;
  })
  .replace(/ {2,}$/gm, `<br>`)
  .replace(/\n/g, "")
  .replace(/^(?!<)(.+)$/gm, (_, text) => {return `<p>${text}</p>`})}\n`;
}
return html;
}

const buildArticle = async (filePath) => {
  const content = await fs.promises.readFile(filePath, "utf-8");
  const fileName = path.basename(filePath, ".md") + ".html";
  const outputPath = path.join(__dirname, "../article", fileName);
  const htmlContent = markdownToHtml(content);

  const html = `
    <html>
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="description" content="">
          <link rel="shortcut icon" href="/public/img/png/favicon.png" type="image/x-icon">
          <link rel="stylesheet" href="/public/css/common.css">
          <script src="/public/js/common.js" defer></script>
          <title></title>
      </head>
      <body>
        <header></header>
        <main>
          <h1 id="title"></h1>
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
