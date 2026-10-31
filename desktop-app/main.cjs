// DogYears desktop shell.
//
// The game is a Vite build that expects to be served over HTTP: ES modules, fetch
// for the glTF asset and the sprite sheets, and pointer lock for the first-person
// controls. file:// cannot do any of that, so the app starts a loopback server for
// its own dist folder and points the window at it. Nothing leaves 127.0.0.1.
const {app, BrowserWindow, shell, Menu} = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'dist');
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.glb': 'model/gltf-binary',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.hdr': 'application/octet-stream',
};

let window = null;
let server = null;

function serve(req, res) {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
    const file = path.resolve(ROOT, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
    const data = fs.readFileSync(file);
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(data);
  } catch {
    res.writeHead(404).end('Not found');
  }
}

function createWindow(url) {
  window = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#111410',
    title: 'DogYears',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      backgroundThrottling: false,
    },
  });
  Menu.setApplicationMenu(null);
  window.once('ready-to-show', () => { window.show(); window.focus(); });
  window.webContents.setWindowOpenHandler(({url: target}) => {
    if (/^https?:/i.test(target)) shell.openExternal(target);
    return {action: 'deny'};
  });
  window.loadURL(url);
  window.on('closed', () => { window = null; });
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (window) { if (window.isMinimized()) window.restore(); window.focus(); }
  });
  app.whenReady().then(() => {
    server = http.createServer(serve);
    server.listen(0, '127.0.0.1', () => {
      createWindow(`http://127.0.0.1:${server.address().port}/`);
    });
  });
  app.on('window-all-closed', () => app.quit());
  app.on('quit', () => { if (server) server.close(); });
}
