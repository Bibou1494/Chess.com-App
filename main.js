const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const template = require('./menubar');
const dns = require('dns');
const { autoUpdater } = require('electron-updater');

let mainWindow;

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        icon: path.join(__dirname, '/Images/icon.png'),
        frame: true,
        autoHideMenuBar: true,  // Automatically hide the menu bar
        webPreferences: {
            nodeIntegration: false,
        }
    });

    // Check for internet connection
    dns.lookup('chess.com', (err) => {
        if (err) {
            // If no internet, load offline.html
            mainWindow.loadFile(path.join(__dirname, 'offline.html'));
        } else {
            // If internet is available, load chess.com
            mainWindow.loadURL('https://chess.com');
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

    // Check for updates
    autoUpdater.checkForUpdatesAndNotify();
});

autoUpdater.on('update-available', () => {
    console.log('Update available!');
});

autoUpdater.on('update-not-available', () => {
    console.log('No updates available.');
});

autoUpdater.on('error', (err) => {
    console.error('Error checking for updates:', err);
});

autoUpdater.on('update-downloaded', () => {
    console.log('Update downloaded. It will be installed on restart.');
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
