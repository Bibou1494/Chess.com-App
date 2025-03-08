const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const template = require('./menubar');

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

    mainWindow.loadURL('https://chess.com'); // Load external website

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
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
