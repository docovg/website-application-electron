const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

const START_URL = 'https://abdelnaim.fr';
const IS_DEV = process.env.NODE_ENV === 'development';

let mainWindow = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0f0f10',
    show: false, 
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      devTools: IS_DEV,           
      spellcheck: false,
      enablePreferredSizeMode: true
    },
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith(START_URL)) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });

  const load = () => win.loadURL(START_URL, {
  });
  load();

  win.once('ready-to-show', () => {
    win.show();
  });

  win.webContents.on('did-fail-load', (_e, code, desc) => {
    console.warn('did-fail-load:', code, desc);
    setTimeout(() => {
      if (!win.isDestroyed()) load();
    }, 1200);
  });

  win.on('closed', () => {
    mainWindow = null;
  });

  return win;
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    mainWindow = createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = createWindow();
      }
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
