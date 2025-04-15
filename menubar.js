const { dialog } = require('electron');
const { autoUpdater } = require('electron-updater');

const template = [
  {
    label: 'File',
    submenu: [
      { role: 'close' }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' }
    ]
  },
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
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' }
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
          autoUpdater.checkForUpdates();

          // Notify when an update is available
          autoUpdater.on('update-available', () => {
            dialog.showMessageBox({
              type: 'info',
              title: 'Update Available',
              message: 'An update is available and is being downloaded.'
            });
          });

          // Notify when no updates are available
          autoUpdater.on('update-not-available', () => {
            dialog.showMessageBox({
              type: 'info',
              title: 'No Updates',
              message: 'Your application is up-to-date.'
            });
          });

          // Handle errors
          autoUpdater.on('error', (err) => {
            dialog.showErrorBox('Update Error', `An error occurred while checking for updates: ${err.message}`);
          });

          // Notify when the update is downloaded
          autoUpdater.on('update-downloaded', () => {
            dialog.showMessageBox({
              type: 'info',
              title: 'Update Ready',
              message: 'Update downloaded. It will be installed on restart.'
            });
          });
        }
      }
    ]
  }
];

module.exports = template;