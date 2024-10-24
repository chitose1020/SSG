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