const { ipcRenderer } = require('electron');

class QobuzNotification {
    constructor() {
        this.lastParent = undefined;
        this.notification = undefined;

        this.getNotification = this.getNotification.bind(this);
        this.parseChild = this.parseChild.bind(this);
        this.ArrayEquals = this.ArrayEquals.bind(this);
        this.notify = this.notify.bind(this);
    }
    start() {
        this.interval = setInterval(this.getNotification, 4000);
    }

    stop() {
        clearInterval(this.interval);
    }

    getNotification() {
        var parent = document.getElementById("now-playing");
        // is playing
        var playBtn = document.getElementById("player-play-button").getElementsByClassName('ui-icon-pause');
        if (playBtn.length > 0) {
            var parsedHtml = this.parseChild(parent);

            if (!this.ArrayEquals(parsedHtml, this.lastParent)) {
                this.lastParent = parsedHtml;
                this.notify(parsedHtml);
            }
        }
    }

    ArrayEquals(arr, arr1) {
        if (!arr) {
            // no current, no Notification
            return true;
        }
        if (!arr[1]) {
            // no current, no Notification
            return true;
        }
        if (!arr1) {
            return false;
        }
        return arr[1] === arr1[1] && arr[2] === arr1[2] && arr[3] === arr1[3] && arr[4] === arr1[4]
    }

    notify(parent) {
        if (Notification.permission === "granted") {
            if (this.notification) {
                this.notification.close();
            }
            this.notification = new window.Notification(parent[2], { body: parent[3] + "\n" + parent[4], icon: parent[1], silent: true });
            setTimeout(this.notification.close.bind(this.notification), 1000);
        }
    }

    parseChild(node) {
        var info = [];
        if (node.localName === 'a') {
            info.push(node.innerHTML);
        } else if (node.localName === 'img') {
            info.push(node.src);
        } else if (node.childNodes.length > 0) {
            node.childNodes.forEach((childNode) => {
                var child = this.parseChild(childNode);
                if (child.length > 0) {
                    if (info.length === 0) {
                        info = child;
                    } else {
                        Array.prototype.push.apply(info, child);
                    }
                }
            });
        }
        return info;
    }
}


const notification = new QobuzNotification();

ipcRenderer.on('prepare-view', function (event, action) {
    // document.getElementById("header-buttons").style.display = 'none';
});

ipcRenderer.on('player:action', function (event, action) {
    document.getElementsByClassName(action)[0].click();
});

ipcRenderer.on('player:notification', function (event, action) {
    switch (action) {
        case 'start':
            notification.start();
            break;
        case 'stop':
            notification.stop();
        default:
            break;
    }
});



 