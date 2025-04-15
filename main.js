const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');
const template = require('./menubar');
const dns = require('dns');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

let mainWindow;

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        icon: path.join(__dirname, '/Images/icon.png'),
        frame: true,
        autoHideMenuBar: true,  // Automatically hide the menu bar
        webPreferences: {
            nodeIntegration: true,
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

    // Silent update check on startup
    autoUpdater.checkForUpdates();
});

// Show dialog only when an update is available
autoUpdater.on('update-available', () => {
    console.log('Update available!');
    dialog.showMessageBox({
        type: 'info',
        title: 'Update Available',
        message: 'An update is available and is being downloaded.',
    });
});

// Do not show dialog when no updates are available
autoUpdater.on('update-not-available', () => {
    console.log('No updates available.');
});

// Handle errors silently unless triggered manually
autoUpdater.on('error', (err) => {
    console.error('Error checking for updates:', err);
});

// Notify when the update is downloaded
autoUpdater.on('update-downloaded', () => {
    console.log('Update downloaded. It will be installed on restart.');
    dialog.showMessageBox({
        type: 'info',
        title: 'Update Ready',
        message: 'Update downloaded. It will be installed on restart.',
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
