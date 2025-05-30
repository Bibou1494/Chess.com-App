const { ipcRenderer } = require('electron');

function sendPlayerNamesIfGamePage() {
  if (window.location.pathname.startsWith('/game')) {
    // Try to extract player names from the DOM
    const usernameElements = document.querySelectorAll('.username');
    if (usernameElements.length >= 2) {
      const player1 = usernameElements[0].innerText.trim();
      const player2 = usernameElements[1].innerText.trim();
      ipcRenderer.send('chesscom-player-names', { player1, player2 });
    }
  }
}

function sendPageTitleIfGamePage() {
  if (window.location.pathname.startsWith('/game')) {
    ipcRenderer.send('chesscom-page-title', document.title);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }

  setTimeout(sendPlayerNamesIfGamePage, 1500); // Wait for DOM to load usernames
});

ipcRenderer.on('chesscom-request-title', () => {
  sendPageTitleIfGamePage();
});