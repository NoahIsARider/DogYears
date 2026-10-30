// Screenshot the public repository page so the README layout can be checked the way GitHub renders it.
// An outbound proxy can be supplied with HTTPS_PROXY when github.com is not reachable directly.
import {chromium} from 'file:///C:/Users/Lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {mkdir} from 'node:fs/promises';

const REPO = process.env.REPO_URL || 'https://github.com/NoahIsARider/DogYears';
const proxy = process.env.HTTPS_PROXY ? {server: process.env.HTTPS_PROXY} : undefined;
await mkdir('deliverables', {recursive: true});

const browser = await chromium.launch({headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', proxy});
const page = await browser.newPage({viewport: {width: 1280, height: 1000}, deviceScaleFactor: 1.5});
await page.goto(REPO, {waitUntil: 'networkidle', timeout: 90000});
await page.waitForTimeout(2500);

const imgs = await page.$$eval('.markdown-body img', els => els.map(e => ({src: e.getAttribute('src'), w: e.naturalWidth, h: e.naturalHeight})));
const broken = imgs.filter(i => !i.w);
console.log(`readme images: ${imgs.length}, broken: ${broken.length}`);
if (broken.length) console.log(JSON.stringify(broken, null, 1));

const art = await page.$('.markdown-body');
const box = art ? await art.boundingBox() : null;
await page.screenshot({path: 'deliverables/readme-preview.png', clip: {x: 0, y: Math.max(0, (box ? box.y : 0) - 20), width: 1280, height: 2200}, fullPage: true});
console.log('screenshot: deliverables/readme-preview.png');
await browser.close();
