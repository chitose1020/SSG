const fs = require("fs");
const path = require("path");

const markdownToHtml = markdown => {
    let id = 0;
    const toc = [];
    const html = markdown
    .replace(/^# (.*$)/gm, (match, p1) => {
        toc.push({ id: `heading-${id + 1}`, text: p1, el: "h2" });
        return `<h2 id="${++id}">${p1}</h2>`;
    })
    .replace(/^## (.*$)/gm, (match, p1) => {
        toc.push({ id: `heading-${id + 1}`, text: p1, el: "h3" });
        return `<h3 id="${++id}">${p1}</h3>`;
    })
    .replace(/\[(.*?)\]\((.*?)\)/g, (_, text, url) => {
       return `<a href="${url}">${text}</a>`;
    })
    .replace(/^(?!<h\d|<a|<\/p>)(.+)$/gm, (_, text) => {return `<p>${text}</p>`;});
    return html;
};

const buildArticle = async (filePath) => {
    const content = await fs.promises.readFile(filePath, "utf-8");
    const fileName = path.basename(filePath, ".md") + ".html";
    const outputPath = path.join("/article", fileName);
    const htmlContent = markdownToHtml(content);

    const html = `
    <html>
      <head>
       <title></title>
      </head>
      <body>
        <header></header>
        <main>
          <h1 id="title"></h1>
          <div id="content"></div>
        </main>
        <footer></footer>
      </body>
    </html>`;
    await fs.promises.writeFile(outputPath, html, "utf-8");
    console.log("built article!")
};

const articles = await fs.promises.readdir("/article/articles");
const tasks = articles
.filter(file => file.endsWith(".md"))
.map(file => buildArticle(path.join("/article/articles", file)));
buildArticle(tasks);