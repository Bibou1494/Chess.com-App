// const isMac = process.platform === 'darwin';

const template = [
  // { role: 'appMenu' }
  // ...(isMac
  //   ? [{
  //       label: app.name,
  //       submenu: [
  //         { role: 'about' },
  //         { type: 'separator' },
  //         { role: 'services' },
  //         { type: 'separator' },
  //         { role: 'hide' },
  //         { role: 'hideOthers' },
  //         { role: 'unhide' },
  //         { type: 'separator' },
  //         { role: 'quit' }
  //       ]
  //     }]
  //   : []),
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [
      { role: 'close' }
    ]
  },
  // { role: 'editMenu' }
  {
    label: 'Edit',
    submenu: [
      // { role: 'undo' },
      // { role: 'redo' },
      // { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      // ...(isMac
      //   ? [
      //       { role: 'pasteAndMatchStyle' },
      //       { role: 'delete' },
      //       { role: 'selectAll' },
      //       { type: 'separator' },
      //       {
      //         label: 'Speech',
      //         submenu: [
      //           { role: 'startSpeaking' },
      //           { role: 'stopSpeaking' }
      //         ]
      //       }
      //     ]
      //   : [
      //       { role: 'delete' },
      //       { type: 'separator' },
      //       { role: 'selectAll' }
      //     ])
    ]
  },
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
      { type: 'separator' },
      {
        label: 'Toggle Developer Tools',
        accelerator: 'Ctrl+Shift+I', // Shortcut for toggling dev tools
        click: (menuItem, browserWindow) => {
          if (browserWindow) {
            browserWindow.webContents.toggleDevTools();
          }
        }
      },
      {
        label: 'Go Back',
        click: (menuItem, browserWindow) => {
          if (browserWindow && browserWindow.webContents.canGoBack()) {
            browserWindow.webContents.goBack();
          }
        }
      }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      // ...(isMac
      //   ? [
      //       { type: 'separator' },
      //       { role: 'front' },
      //       { type: 'separator' },
      //       { role: 'window' }
      //     ]
      //   : [
      //       { role: 'close' }
      //     ])
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          const { shell } = require('electron');
          await shell.openExternal('https://github.com/Bibou1494/Chess.com-App');
        }
      },
      {
        label: 'Check For Updates',
        click: () => {
          const { autoUpdater } = require('electron-updater');
          autoUpdater.checkForUpdatesAndNotify();
        }
      }
    ]
  }
]

module.exports = template;