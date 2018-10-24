'use strict';
// Dados Aplicativo
const APP_NAME = 'DrogaFarmBox';
const VERSION = '0.1.0';

// modulos
const electron  = require('electron');
const path      = require('path');
const ospath = require('ospath');
const jsonfile  = require('jsonfile');

// variaveis
let absPath = path.dirname(__dirname), configFile = ospath.data() + '/' + APP_NAME + '/config.json';
let {app, ipcMain, BrowserWindow, Menu, dialog} = electron;
let mainWindow, appConfig = {drogafarmbox: {}, app: {sessionUser: null, UserCaixa: null, StatusCaixa: null, enableAnimation: true}};

app.showExitPrompt = true;

//cria janela do app
let startMainWindow = function () {
    mainWindow = new BrowserWindow({
        backgroundColor: '#1A242D',
        width: 1100,
        height: 780,
        center: true,
        title: app.getName(),
        minHeight: 700,
        minWidth: 900,
        icon: absPath + '/ico.ico'
    });
    
    // html inicial
    mainWindow.loadURL('file://' + absPath + '/src/initialize.html');

    /* Debugging
    mainWindow.webContents.openDevTools();
    */
    //mainWindow.webContents.openDevTools();

    

    // pergunta antes de fecha o applicativo
    mainWindow.on('close', (e) => {
        if (app.showExitPrompt) {
            e.preventDefault() // Prevents the window from closing 
            dialog.showMessageBox({
                type: 'question',
                buttons: ['Sim', 'Não'],
                title: 'Confirmar saida',
                message: 'Você tem certeza que quer sair?'
            }, function (response) {
                if (response === 0) { // Runs the following if 'Yes' is clicked
                    app.showExitPrompt = false
                    mainWindow.close()
                }
            })
        }
    });

    mainWindow.on('closed', (e) => {
        mainWindow = null;
    });

    // inicia maximizado
    //mainWindow.maximize();

};

// set nome app
app.setName(APP_NAME);

// Iniciando app
// Verifica se os dados de configuracao existe
// e inicia o initialize.html
app.on('ready', () => {
    try {
       
        appConfig = jsonfile.readFileSync(configFile);
        

    } catch (e) {
        /* Ignore. Uses default settings. */
    } finally {
        startMainWindow();
    }
});

// verifica se o mainWindow esta ativado
app.on('activate', () => {
    if (mainWindow === null) startMainWindow();
});

exports.openWindow = (filename) => {
    let win = new BrowserWindow({width: 300, height: 300, frame: false})
    win.loadURL(`file://${__dirname}/` + filename + `.html` )
}


//Menu do programa
app.on('browser-window-created', (e, window) => {
    let menuTemplate = [{
        label: 'File',
        submenu: [{ role: 'quit' }]
    }, {
        
    }, {
       
    }];

    let menu = Menu.buildFromTemplate(menuTemplate);

    if (process.platform === 'darwin' || process.platform === 'mas') {
        Menu.setApplicationMenu(menu);

    } else {
        window.setMenu(menu);
    }
   
});


app.on('window-all-closed', (e) => {
    if(process.platform !== 'darwin') app.quit();
});

ipcMain.on('get-config', (event, arg) => {
    if (arg === 'VERSION') {
        event.returnValue = VERSION;
        return;
    }
    event.returnValue = appConfig[arg];
    
});

ipcMain.on('write-config', (event, arg) => {
    appConfig[arg.name] = arg.config;

    jsonfile.writeFile(configFile, appConfig, function (error) {
        if (error) {
            event.sender.send('write-config-error', {message: 'Could not write configuration file.' + error});

        } else {
            event.sender.send('write-config-success', {message: 'Configuration saved successfully'});
        }
    });
});

ipcMain.on('open-external', (event, arg) => {
    electron.shell.openExternal(arg);
});
