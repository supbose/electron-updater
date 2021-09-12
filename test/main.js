import autoUpdater from '../dist/app'
import {app, BrowserWindow, Menu, Tray} from 'electron'
import path from 'path'

let mainWindow, appTray

/* test github */
// const update = autoUpdater({
//     type: 'github',
//     options: {
//         username: 'sunzongzheng',
//         repo: 'electron-updater',
//         log: true
//     }
// })

/* test custom with url */
// const update = autoUpdater({
//     type: 'custom',
//     options: {
//         url: 'https://gist.githubusercontent.com/sunzongzheng/049eb84dbc3f0a63016bb36193a46df3/raw/',
//         log: true
//     }
// })

/* test custom with getRemoteLatest */
const update = autoUpdater({
    type: 'custom',
    options: {
        getRemoteLatest() {
            return new Promise((resolve) => {
                this.latestRelease.linux = 'https://store.zzsun.cc/electron-updater-1.0.0-x86_64.AppImage'
                this.latestRelease.osx = 'https://store.zzsun.cc/electron-updater-1.0.0-mac.zip'
                this.latestRelease.windows = 'https://store.zzsun.cc/electron-updater.Setup.1.0.0.exe'
                this.latestVersion = 'v1.0.0'
                this.emit('log', this.latestRelease)
                resolve(100000000)
            })
        },
        log: true
    }
})

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 400,
        height: 200,
        maxHeight:200,
        maxWidth:400,
        minHeight:200,
        minWidth:400,
        frame: false,
        skipTaskbar: true,
        transparent: true,
        resizable: true,      
        webPreferences: {
          contextIsolation: false, // 设置此项为false后，才可在渲染进程中使用electron api
          nodeIntegration: true,
          devTools: true,
          experimentalFeatures: true
        }
    })
    mainWindow.loadURL(`file://${__dirname}/index.html?version=${app.getVersion()}`)
    mainWindow.webContents.openDevTools()
    mainWindow.on('closed', function () {
        mainWindow = null
    })

    appTray = new Tray(path.join(__dirname, 'images/yosoro-icon-32.png'))

    const contextMenu = Menu.buildFromTemplate([
        {
            label: '显示主界面',
            click() {
                mainWindow.show()
            }
        },
        {
            label: '退出',
            click() {
                app.quit()
            }
        }
    ])
    appTray.setContextMenu(contextMenu)

    setTimeout(() => {
        update.on('checking-for-update', () => {
            mainWindow.webContents.send('checking-for-update')
        })
        update.on('update-available', () => {
            mainWindow.webContents.send('update-available')
        })
        update.on('update-not-available', () => {
            mainWindow.webContents.send('update-not-available')
        })
        update.on('download-progress', (percent) => {
            mainWindow.webContents.send('download-progress', `${percent}%`)
        })
        update.on('error', (e) => {
            mainWindow.webContents.send('error', e)
        })
        update.on('log', (log) => {
            mainWindow.webContents.send('log', log)
        })
        update.checkForUpdatesAndNotify()
    }, 3000)
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
})
