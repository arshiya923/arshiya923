import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, (m) => m.slice(1)));
const root = decodeURIComponent(here);
const data = JSON.parse(fs.readFileSync(path.join(root, "resume-data.json"), "utf8"));

const labels = {
  en: {
    lang: "en",
    dir: "ltr",
    summary: "Profile",
    skills: "Core Skills",
    experience: "Experience",
    projects: "Selected Project",
    education: "Education & Credentials",
    born: "Born",
    linkedin: "LinkedIn",
    github: "GitHub",
    training: "Training",
    languages: "Languages"
  },
  fa: {
    lang: "fa",
    dir: "rtl",
    summary: "خلاصه حرفه‌ای",
    skills: "مهارت‌های کلیدی",
    experience: "سوابق حرفه‌ای",
    projects: "پروژه منتخب",
    education: "تحصیلات و گواهی‌ها",
    born: "تولد",
    linkedin: "LinkedIn",
    github: "GitHub",
    training: "آموزش",
    languages: "زبان‌ها"
  }
};

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

function inline(value) {
  return escapeHtml(value).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function skillValue(value, locale) {
  let rendered = inline(value);
  if (locale === "fa") {
    rendered = rendered.replace(
      /Entity Framework Core|SQL Server|MySQL|SQLite|SQL/g,
      (term) => `<span class="ltr-token">${term}</span>`
    );
  }
  return rendered;
}

function ltr(value) {
  return `<span class="ltr-token">${escapeHtml(value)}</span>`;
}

function renderHtml(locale) {
  const t = labels[locale];
  const p = data.person;
  const rtl = locale === "fa";
  const skills = data.skills.map((skill) => `
      <div class="skill-row">
        <dt>${inline(skill.label[locale])}</dt>
        <dd>${skillValue(skill.value[locale], locale)}</dd>
      </div>`).join("");
  const experience = data.experience.map((item) => `
      <article class="entry">
        <div class="entry-head">
          <h3 class="entry-title">${inline(item.title[locale])}</h3>
          <time class="entry-dates">${inline(item.dates[locale])}</time>
        </div>
        <p class="entry-meta">${inline(item.company[locale])} · ${inline(item.location[locale])}</p>
        <ul>${item.bullets[locale].map((bullet) => `<li>${inline(bullet)}</li>`).join("")}</ul>
      </article>`).join("");
  const projects = data.projects.map((item) => `
      <article class="entry">
        <div class="entry-head">
          <h3 class="entry-title">${inline(item.name[locale])}</h3>
          <time class="entry-dates">${inline(item.dates[locale])}</time>
        </div>
        <p class="entry-meta">${ltr(item.stack)}</p>
        <ul>${item.bullets[locale].map((bullet) => `<li>${inline(bullet)}</li>`).join("")}</ul>
      </article>`).join("");
  const credential = data.credentials[0];
  const headerCells = rtl
    ? `<img class="profile-photo" src="${escapeHtml(p.photo)}" alt="${escapeHtml(p.name[locale])}"><div class="identity">${identity()}</div>`
    : `<div class="identity">${identity()}</div><img class="profile-photo" src="${escapeHtml(p.photo)}" alt="${escapeHtml(p.name[locale])}">`;

  function identity() {
    return `<h1>${inline(p.name[locale])}</h1>
      <p class="headline">${inline(p.headline[locale])}</p>
      <div class="contact-line">
        <span>${inline(p.location[locale])}</span>
        <span>${ltr(p.phone)}</span>
        <span><a href="mailto:${escapeHtml(p.email)}">${ltr(p.email)}</a></span>
        <span><a href="${escapeHtml(p.linkedin)}">${t.linkedin}</a></span>
        <span><a href="${escapeHtml(p.github)}">${t.github}</a></span>
        <span>${t.born}: ${rtl ? inline(p.birthDate[locale]) : ltr(p.birthDate[locale])}</span>
      </div>`;
  }

  return `<!doctype html>
<html lang="${t.lang}" dir="${t.dir}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(p.name[locale])} - ${escapeHtml(p.headline[locale])}</title>
  <link rel="stylesheet" href="resume.css">
</head>
<body dir="${t.dir}">
<main>
  <header class="resume-header">${headerCells}</header>
  <section aria-labelledby="summary-heading">
    <h2 id="summary-heading">${t.summary}</h2>
    <p class="summary">${inline(data.summary[locale])}</p>
  </section>
  <section aria-labelledby="skills-heading">
    <h2 id="skills-heading">${t.skills}</h2>
    <dl class="skill-list">${skills}</dl>
  </section>
  <section aria-labelledby="experience-heading">
    <h2 id="experience-heading">${t.experience}</h2>
    ${experience}
  </section>
  <section aria-labelledby="projects-heading">
    <h2 id="projects-heading">${t.projects}</h2>
    ${projects}
  </section>
  <section aria-labelledby="education-heading">
    <h2 id="education-heading">${t.education}</h2>
    <div class="compact-grid education-line">
      <div><strong>${inline(data.education.degree[locale])}</strong> · ${inline(data.education.institution[locale])}</div>
      <time class="entry-dates">${inline(data.education.dates[locale])}</time>
    </div>
    <div class="compact-grid credential-line">
      <div><strong>${inline(credential.name[locale])}</strong> · ${inline(credential.issuer[locale])}</div>
      <time class="entry-dates">${inline(credential.date[locale])}</time>
    </div>
    <p class="training-line"><strong>${t.training}:</strong> ${inline(data.training[locale])}</p>
    <p class="languages-line"><strong>${t.languages}:</strong> ${inline(data.languages[locale])}</p>
  </section>
</main>
</body>
</html>`;
}

function plain(value) {
  return String(value).replaceAll("**", "");
}

function renderText(locale) {
  const t = labels[locale];
  const p = data.person;
  const lines = [
    p.name[locale],
    p.headline[locale],
    `${p.location[locale]} | ${p.phone} | ${p.email}`,
    `${t.linkedin}: ${p.linkedin} | ${t.github}: ${p.github} | ${t.born}: ${p.birthDate[locale]}`,
    "",
    t.summary.toUpperCase(),
    plain(data.summary[locale]),
    "",
    t.skills.toUpperCase()
  ];
  for (const skill of data.skills) lines.push(`${plain(skill.label[locale])}: ${plain(skill.value[locale])}`);
  lines.push("", t.experience.toUpperCase());
  for (const item of data.experience) {
    lines.push(`${item.title[locale]} | ${item.company[locale]} | ${item.dates[locale]}`);
    lines.push(`${item.location[locale]}`);
    for (const bullet of item.bullets[locale]) lines.push(`- ${plain(bullet)}`);
  }
  lines.push("", t.projects.toUpperCase());
  for (const item of data.projects) {
    lines.push(`${item.name[locale]} | ${item.dates[locale]} | ${item.stack}`);
    for (const bullet of item.bullets[locale]) lines.push(`- ${plain(bullet)}`);
  }
  lines.push("", t.education.toUpperCase());
  lines.push(`${data.education.degree[locale]} | ${data.education.institution[locale]} | ${data.education.dates[locale]}`);
  for (const credential of data.credentials) lines.push(`${credential.name[locale]} | ${credential.issuer[locale]} | ${credential.date[locale]}`);
  lines.push(`${t.training}: ${data.training[locale]}`);
  lines.push(`${t.languages}: ${data.languages[locale]}`);
  return `${lines.join("\n")}\n`;
}

for (const locale of ["en", "fa"]) {
  fs.writeFileSync(path.join(root, `resume-${locale}.html`), renderHtml(locale), "utf8");
  fs.writeFileSync(path.join(root, `resume-${locale}.txt`), renderText(locale), "utf8");
}

const moduleRoots = [
  process.env.CODEX_NODE_MODULES,
  path.join(os.homedir(), ".cache", "codex-runtimes", "codex-primary-runtime", "dependencies", "node", "node_modules")
].filter(Boolean);
const playwrightPath = moduleRoots.map((base) => path.join(base, "playwright")).find(fs.existsSync);
if (!playwrightPath) throw new Error("Playwright was not found. Set CODEX_NODE_MODULES to the bundled node_modules path.");
const require = createRequire(import.meta.url);
const { chromium } = require(playwrightPath);

const browserCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
].filter(Boolean);
const executablePath = browserCandidates.find(fs.existsSync);
if (!executablePath) throw new Error("Chrome or Edge executable was not found. Set CHROME_PATH.");

const browser = await chromium.launch({ headless: true, executablePath });
try {
  for (const locale of ["en", "fa"]) {
    const page = await browser.newPage({ viewport: { width: 1240, height: 1754 }, deviceScaleFactor: 1 });
    const htmlPath = path.join(root, `resume-${locale}.html`);
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });
    await page.evaluate(async () => { await document.fonts.ready; });
    await page.pdf({
      path: path.join(root, `resume-${locale}.pdf`),
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" }
    });
    await page.close();
  }
} finally {
  await browser.close();
}

console.log("Generated bilingual HTML, text, and PDF résumé files.");
