import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { readdir } from 'fs'

const template = (win) => Menu.buildFromTemplate([
  {
    label: 'Studio',
    submenu: [
      {
        label: 'About Studio',
        click () {
          dialog.showMessageBox(win, {
            title: app.getName(),
            buttons: ['OK'],
            message: 'An IDE for you',
            detail: 'c) gaetgu and dragonDScript 2021',
            type: 'info'
          })
        }
      },
      {
        type: 'separator'
      },
      {
        role: 'quit',
        accelerator: 'CmdOrCtrl+Q'
      }
    ]
  },
  {
    label: 'File',
    submenu: [
      {
        label: 'Open folder',
        click: async () => {
          const d = await dialog.showOpenDialog(win, {
            properties: ['openDirectory', 'createDirectory'],
            title: 'Delta Studio'
          })
          if (d.canceled) {
            console.log('Operation [open-folder] cancelled.')
            return
          }
          console.log(`Opening ${d.filePaths}`)
          readdir(d.filePaths[0], {
            encoding: 'utf-8'
          }, (err, files) => {
            if (err) throw err
            win.webContents.send('open-folder', d.filePaths, files)
          })
        },
        accelerator: 'Ctrl+O'
      },
      {
        type: 'separator'
      },
      {
        label: 'Save',
        click: () => win.webContents.send('file.save', 'current'),
        accelerator: 'CmdOrCtrl+S'
      },
      {
        label: 'Duplicate',
        click: () => win.webContents.send('file.duplicate', 'current'),
        accelerator: 'CmdOrCtrl+D'
      },
      {
        label: 'Lint',
        click: () => win.webContents.send('file.lint', 'current'),
        accelerator: 'Alt+L'
      },
      {
        label: 'Close file',
        click: () => win.webContents.send('file.save', 'current'),
        accelerator: 'CmdOrCtrl+W'
      }
    ]
  },
  {
    role: 'editMenu'
  },
  {
    role: 'viewMenu'
  },
  {
    label: 'Window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        click: () => win.minimize()
      },
      {
        label: 'Close',
        click: () => win.close(),
        accelerator: 'Alt+Q'
      }
    ]
  }
])

app.whenReady().then(() => {
  const win = new BrowserWindow({
    frame: false,
    minHeight: 5 * 100,
    minWidth: 5 * 100,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false
    }
  })
  win.loadURL(
    'file://' + join(__dirname, 'index.html')
  )
  win.setMenuBarVisibility(false)
  ipcMain.on('minimize-main', () => win.minimize())
  ipcMain.on('maximize-main', () => win.isMaximized() ? win.unmaximize() : win.maximize())
  ipcMain.on('trigger-context-menu', () => {
    template(win).popup({
      window: win,
      x: 12,
      y: 12
    })
  })
  Menu.setApplicationMenu(template(win))
})
