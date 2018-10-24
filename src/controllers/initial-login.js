/* global app:true ipcRenderer:true kongConfig:true appConfig:true*/
(function (window, angular, app, ipcRenderer, kongConfig, appConfig) { 'use strict';
const controller = 'InitialSetupControllerLogin';
if (typeof app === 'undefined') throw (controller + ': app is undefined');

app.controller(controller, ['$scope', '$element', '$base64', 'ajax', 'toast',
    function ($scope, $element, $base64, ajax, toast) {

    $scope.kongConfig = kongConfig;
    $scope.appConfig  = appConfig;
    $scope.version = ipcRenderer.sendSync('get-config', 'VERSION');
    $scope.kongConfig.sessionUser = $scope.kongConfig.UserName;
    let form = $element.find('form#formLogin');
    let connect = function (config, writeConfig) {
        if ($scope.kongConfig.host.charAt($scope.kongConfig.host.length - 1) === '/') {
            $scope.kongConfig.host = $scope.kongConfig.host.substring(0, $scope.kongConfig.host.length - 1);
        }
        ajax.get(config).then(function (response) {
            try {
                if (typeof response.data !== 'object') {
                    toast.error('Não foi possível detectar DrogaFarmBox Admin API rodando no URL fornecido');
                    if (form.hasClass('hidden')) form.fadeIn(400);
                    return;
                }
            } catch (e) {
                toast.error('Não foi possível detectar DrogaFarmBox Admin API rodando no URL fornecido');
                if (form.hasClass('hidden')) form.fadeIn(400);
                return;
            }
                //dados user
                var result = response.data;
                for(var i = 0, len = result.length; i < len; i++)
                {
                    //verifica se o usuario é valido
                    if(result[0] == 1)
                    {
                        
                        //salvando dados usuario logado
                        $scope.appConfig.sessionUser = result[1].UsrName;
                        $scope.appConfig.UserCaixa = result[1].NCaixa;
                        $scope.appConfig.StatusCaixa = result[1].CaixaStatus;
                        toast.success('Logando...');

                        //$element.fadeOut({ duration: 400, complete: function () { window.location.href = 'index.html'; } });
                        ipcRenderer.send('write-config', { name: 'app', config: $scope.appConfig });
                        return;
                                        
                    }
                    else{
                        toast.error('Usuario Informado é invalido, por favor informe um usuario valido!');
                        /*let interval = setInterval(function () {
                            clearInterval(interval);
                            window.location.href = 'login.html';
                        }, 2000);*/
                    }
                }

        }, function (response) {
            if (form.hasClass('hidden')) form.fadeIn(400);

            if (response.status && 401 === parseInt(response.status)) {
                toast.error('Falha conexão com DrogaFarmBox Admin API: Forneça o nome de usuário e a senha corretos');

            } else {
                toast.error('Não pôde se conectar ao ' + $scope.kongConfig.host);
            }
        });
    };

    ipcRenderer.on('write-config-success', function () {
        $element.fadeOut({ duration: 400, complete: function () { window.location.href = 'index.html'; } });

    }).on('write-config-error', function (event, arg) {
        toast.error(arg.message);

        let interval = setInterval(function () {
            clearInterval(interval);
            window.location.href = 'login.html';
        }, 2000);
    });

    form.on('submit', function (event) {

        event.preventDefault();
        
        let config = {url: $scope.kongConfig.host + '/user/login/index.php?username='+ $scope.kongConfig.UserName + 
        '&password=' + $scope.kongConfig.UserPassword, data: $(this).serialize(),dataType:"json", headers: {}};
        
        if ($scope.kongConfig.username) {
            config.headers['Authorization'] = 'Basic ' + $base64.encode($scope.kongConfig.username + ':' + ($scope.kongConfig.password || ''));
        }

        connect(config, true);

        return false;
    });

}]);

})(window, window.angular, app, ipcRenderer, kongConfig, appConfig);