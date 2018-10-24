/* global app:true ipcRenderer:true kongConfig:true */
(function (window, angular, app, ipcRenderer, kongConfig) { 'use strict';
    const controller = 'InitialSetupController';
    if (typeof app === 'undefined') throw (controller + ': app is undefined');
    
    app.controller(controller, ['$scope', '$element', '$base64', 'ajax', 'toast',
        function ($scope, $element, $base64, ajax, toast) {
        let statusBar = $element.find('footer.footer').children('span');
        statusBar.html('Carregando configuração...');

        $scope.kongConfig = kongConfig;
        $scope.version = ipcRenderer.sendSync('get-config', 'VERSION');

        let form = $element.find('form#configForm');
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
                if (writeConfig === true) {
                    ipcRenderer.send('write-config', { name: 'drogafarmbox', config: $scope.kongConfig });

                } else {
                    $element.fadeOut({ duration: 300, complete: function () { window.location.href = 'login.html'; } });
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
            $element.fadeOut({ duration: 300, complete: function () { window.location.href = 'login.html'; } });

        }).on('write-config-error', function (event, arg) {
            toast.error(arg.message);

            let interval = setInterval(function () {
                clearInterval(interval);
                window.location.href = 'login.html';
            }, 2000);
        });

        form.on('submit', function (event) {
            event.preventDefault();

            let config = {url: $scope.kongConfig.host, headers: {}};
            if ($scope.kongConfig.username) {
                config.headers['Authorization'] = 'Basic ' + $base64.encode($scope.kongConfig.username + ':' + ($scope.kongConfig.password || ''));
            }
            connect(config, true);
            return false;
        });

        let timeout = setInterval(function () {
            statusBar.html('');
            $element.find('.icon').slideUp({ duration: 300 });

            if (typeof $scope.kongConfig.host === 'string' && $scope.kongConfig.host) {
                connect({url: kongConfig.host,data: "", dataType: 'json',}, false);
                clearInterval(timeout);

            } else {
                form.fadeIn({ duration: 400, complete: function () { clearInterval(timeout); } });
            }
        }, 2000);
    }]);

})(window, window.angular, app, ipcRenderer, kongConfig);