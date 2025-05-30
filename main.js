const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');
const template = require('./menubar');
const dns = require('dns');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

const DiscordRPC = require('discord-rpc');
const ID = '1363192169254486096';
const RPC = new DiscordRPC.Client({ transport: 'ipc' });

// Discord RPC
DiscordRPC.register(ID);

async function activity() {
    if (!RPC) return;

    console.log("Setting Discord activity...");
    RPC.setActivity({
        details: 'Playing Chess',
        instance: false,
        startTimestamp: Date.now(),
    }).catch(err => {
        console.error("Error setting activity:", err);
    });
}

RPC.on('ready', async () => {
    console.log("RPC Presence up");
    activity();
});

RPC.on('error', (err) => {
    console.error("Discord RPC Error:", err);
});

RPC.login({ clientId: ID })
    .then(() => {
        console.log("Logged into Discord RPC successfully.");
    })
    .catch(err => {
        console.error("Error logging into Discord RPC:", err);
    });


let mainWindow;

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

function setRPCForURL(url, playerNames, pageTitle) {
    if (!RPC) return;
    let details = 'Browsing Chess.com';
    if (url.includes('/play/online')) {
        details = 'Playing Online Chess';
    } else if (url.includes('/play/computer')) {
        details = 'Playing vs Computer';
    } else if(url.includes('/game/live')) {
        if (pageTitle) {
            const match = pageTitle.match(/^Chess: (.+? vs .+?) -/);
            if (match && match[1]) {
                details = `Replaying ${match[1]}`;
            } else {
                details = 'Replaying a Chess Game';
            }
        } else {
            details = 'Replaying a Chess Game';
        }
    } else if (url.includes('/puzzles')) {
        details = 'Solving Puzzles';
    } else if (url.includes('/lessons')) {
        details = 'Learning Chess';
    } else if (url.includes('/analysis')) {
        details = 'Analyzing a Game';
    } else if (url.includes('/news')) {
        details = 'Reading Chess News';
    } else if (url.includes('/live')) {
        details = 'Watching Live Chess';
    } else if (url.includes('/game')) {
        // Use playerNames from preload if available
        if (playerNames && playerNames.player1 && playerNames.player2) {
            details = `Playing ${playerNames.player1} vs ${playerNames.player2}`;
        } else {
            details = 'Playing a Chess Game';
        }
    }
    let buttons = undefined;
    if(url.includes('/game/live')) {
        let gameUrl = url;
        // If the url is not a full URL, prepend https://www.chess.com
        if (!gameUrl.startsWith('http')) {
            gameUrl = 'https://www.chess.com' + gameUrl;
        }
        buttons = [
            {
                label: 'View Game on Chess.com',
                url: gameUrl
            }
        ];
    }
    RPC.setActivity({
        details,
        instance: false,
        startTimestamp: Date.now(),
        buttons
    }).catch(err => {
        console.error('Error setting activity:', err);
    });
}

const { ipcMain } = require('electron');
let lastLiveGameURL = null;
let lastPlayerNames = null;
let lastPageTitle = null;
ipcMain.on('chesscom-player-names', (event, playerNames) => {
    if (lastLiveGameURL) {
        lastPlayerNames = playerNames;
        setRPCForURL(lastLiveGameURL, playerNames, lastPageTitle);
    }
});
ipcMain.on('chesscom-page-title', (event, pageTitle) => {
    if (lastLiveGameURL) {
        lastPageTitle = pageTitle;
        setRPCForURL(lastLiveGameURL, lastPlayerNames, pageTitle);
    }
});

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        icon: path.join(__dirname, '/Images/icon.png'),
        frame: true,
        autoHideMenuBar: true,  // Automatically hide the menu bar
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // Disable context isolation for compatibility
            preload: path.join(__dirname, 'preload.js'),
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

    mainWindow.webContents.on('did-navigate', (event, url) => {
        if (url.includes('/game/live')) {
            lastLiveGameURL = url;
            lastPlayerNames = null;
            lastPageTitle = null;
            setRPCForURL(url, lastPlayerNames, lastPageTitle);
            // Ask renderer to send page title
            mainWindow.webContents.send('chesscom-request-title');
        } else {
            lastLiveGameURL = null;
            lastPlayerNames = null;
            lastPageTitle = null;
            setRPCForURL(url);
        }
    });
    mainWindow.webContents.on('did-navigate-in-page', (event, url) => {
        if (url.includes('/game/live')) {
            lastLiveGameURL = url;
            lastPlayerNames = null;
            lastPageTitle = null;
            setRPCForURL(url, lastPlayerNames, lastPageTitle);
            mainWindow.webContents.send('chesscom-request-title');
        } else {
            lastLiveGameURL = null;
            lastPlayerNames = null;
            lastPageTitle = null;
            setRPCForURL(url);
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
