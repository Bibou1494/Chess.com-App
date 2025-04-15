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
    
    autoUpdater.checkForUpdatesAndNotify();
});

autoUpdater.on('update-available', () => {
    console.log('Update available!');
    dialog.showMessageBox({
        type: 'info',
        title: 'Update Available',
        message: 'An update is available and is being downloaded.',
    });
});

autoUpdater.on('update-not-available', () => {
    console.log('No updates available.');
    dialog.showMessageBox({
        type: 'info',
        title: 'No Updates',
        message: 'Your application is up-to-date.',
    });
});

autoUpdater.on('error', (err) => {
    console.error('Error checking for updates:', err);
    dialog.showErrorBox('Update Error', 'An error occurred while checking for updates. Please check the logs for more details.');
});

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
