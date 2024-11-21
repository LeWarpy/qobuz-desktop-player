const ipcRenderer = require('electron').ipcRenderer;

const webview = document.getElementById("webview");

webview.addEventListener('load-commit', function () {
    webview.send('prepare-view');
    // webview.openDevTools();    
});

ipcRenderer.on('player:action', function (event, message) {
    webview.send('player:action', message);
});

ipcRenderer.on('player:notification', function (event, message) {
    webview.send('player:notification', message);
});

// on quit : reload to save last state
ipcRenderer.on('player:quit', () => {  
   webview.reload();   
});

document.addEventListener('DOMContentLoaded', () => {
    const webview = document.getElementById('webview');

    webview.addEventListener('dom-ready', () => {
        function extractData() {
            webview.executeJavaScript(`
                (function() {
                    const trackCoverImg = document.querySelector('.player__track-cover img');
                    const trackNameElement = document.querySelector('.player__track-name');
                    const artistElement = document.querySelector('.player__track-album a');
                    
                    const timeContent = document.querySelector('.player__track-time-content');
                    const timeTextElements = timeContent.querySelectorAll('.player__track-time-text');

                    // Watch for the play/pause button
                    const pausedButton = document.querySelector('.pct-player-play');
                    if (pausedButton) {
                        paused = true;
                    } else {
                        paused = false;
                    }

                    const data = {
                        trackCover: trackCoverImg ? trackCoverImg.src : null,
                        trackName: trackNameElement ? trackNameElement.textContent.trim() : null,
                        artist: artistElement ? artistElement.textContent.trim() : null,
                        startTime: timeTextElements[0].textContent || '00:00',
                        endTime: timeTextElements[1].textContent || '00:00',
                        songUrl: trackNameElement ? trackNameElement.href : null,
                        paused: paused
                    };

                    return data;
                })();
            `).then((result) => {
                console.log('Extracted Data:', result);
                // Envoyer les données au processus principal
                ipcRenderer.send('update-discord-rpc', result);
            }).catch((error) => {
                console.error('Error:', error);
            });
        }

        const updateInterval = setInterval(extractData, 1000);

        const cleanup = () => {
            clearInterval(updateInterval);
        };

        window.addEventListener('beforeunload', cleanup);
    });
});

ipcRenderer.on('start-rpc', () => {
    console.log('Starting RPC updates');
});

