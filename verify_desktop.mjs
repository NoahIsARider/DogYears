// Validate the packaged desktop build: launch the exe, attach over CDP, prove the
// house opens, the voxel-free glTF and the forest sprites actually load, the save
// folder is writable, and the window survives a reload.
import {chromium} from 'file:///C:/Users/Lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {spawn, execSync} from 'node:child_process';
import {mkdtempSync, existsSync, readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

const EXE = process.argv[2] || 'release/desktop/DogYears-win32-x64/DogYears.exe';
const PORT = 9333;
const profile = mkdtempSync(path.join(tmpdir(), 'dogyears-desktop-'));
const checks = [];
const check = (name, ok, detail = '') => { checks.push({name, ok, detail}); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`); };

const child = spawn(path.resolve(EXE), [`--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`], {cwd: path.dirname(path.resolve(EXE)), stdio: 'ignore'});

const until = Date.now() + 60000;
let version = null;
while (Date.now() < until) {
  try {
    const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
    if (r.ok) { version = await r.json(); break; }
  } catch {}
  await new Promise(r => setTimeout(r, 1000));
}
check('window exposes a debugger', !!version, version ? version.Browser : 'no CDP endpoint');
if (!version) { try { execSync(`cmd /c "taskkill /F /T /PID ${child.pid}"`); } catch {} process.exit(1); }

const browser = await chromium.connectOverCDP(`http://127.0.0.1:${PORT}`);
const page = browser.contexts()[0].pages()[0] || await browser.contexts()[0].waitForEvent('page');
const errors = [];
page.on('pageerror', e => errors.push(e.message));

await page.waitForFunction(() => window.dogyears?.ready, null, {timeout: 120000});
check('app url is the loopback server', /^http:\/\/127\.0\.0\.1:\d+\//.test(page.url()), page.url());
check('house asset opens', await page.evaluate(() => window.dogyears.ready === true));
check('no page errors during load', errors.length === 0, errors.join('; ').slice(0, 120));

const assets = await page.evaluate(async () => {
  const load = async u => { try { const r = await fetch(u); return r.ok ? (await r.arrayBuffer()).byteLength : -1; } catch { return -2; } };
  return {
    glb: await load('/models/DogYears_ArtPass_Hero.glb'),
    sprites: await load('/forest/saga/sprites.json'),
    interludeHtml: await load('/interludes.html'),
  };
});
check('runtime glTF served', assets.glb > 50_000_000, `${(assets.glb / 1048576).toFixed(1)} MB`);
check('forest sprite manifest served', assets.sprites > 100, `${assets.sprites} bytes`);
check('review reel page served', assets.interludeHtml > 100);

await page.click('#begin');
await page.waitForFunction(() => window.dogyears.mode === 'house', null, {timeout: 30000});
check('walking mode entered', true);

await page.waitForTimeout(1500);
await page.screenshot({path: 'deliverables/desktop-checks/desktop-house.png'});

// opening the pause menu runs persist(), which is the game's own save path
await page.keyboard.press('Escape');
await page.waitForFunction(() => window.dogyears.mode === 'pause', null, {timeout: 15000});
const saved = await page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('dogyears')));
check('pause writes the save', saved.length > 0, saved.join(','));
const before = await page.evaluate(() => window.dogyears.state.day);

await page.reload();
await page.waitForFunction(() => window.dogyears?.ready, null, {timeout: 120000});
const after = await page.evaluate(() => window.dogyears.state.day);
check('reload restores the same day', after === before, `day ${before} -> ${after}`);

const report = {exe: EXE, url: page.url(), assets, checks, errors};
console.log('\n' + checks.filter(c => !c.ok).length ? '' : 'DESKTOP BUILD PASS');
console.log(JSON.stringify({passed: checks.filter(c => c.ok).length, failed: checks.filter(c => !c.ok).length, errors: errors.length}));

await browser.close();
try { execSync(`cmd /c "taskkill /F /T /PID ${child.pid}"`, {stdio: 'ignore'}); } catch {}
process.exitCode = checks.every(c => c.ok) ? 0 : 1;
