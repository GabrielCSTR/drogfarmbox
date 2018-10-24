'use strict';

/* global app:true ipcRenderer:true kongConfig:true appConfig:true */
(function (angular, app, ipcRenderer, kongConfig, appConfig) {

    const controller = 'DashboardController';
    if (typeof app === 'undefined') throw (controller + ': app is undefined');
   
    app.controller(controller, ['$scope', 'ajax', 'toast', 'viewFactory', function ($scope, ajax, toast, viewFactory) {

        viewFactory.title = 'Dashboard';
        viewFactory.prevUrl = null;

        $scope.appConfig  = appConfig;

        $scope.UserName = appConfig.sessionUser;
        $scope.NCaixa = appConfig.UserCaixa;
        $scope.StatusCaixa = appConfig.StatusCaixa;

        // vefifica se o caixa esta aberto/fechado
        // 2 = fechado /  1 = aberto
        if($scope.appConfig.StatusCaixa == 1)
        {
            if ($scope.class === "red")
                $scope.class = "green";
            else
                $scope.class = "green";
                $scope.StatusCaixa = "ABERTO";
                angular.element(document.getElementById('opencaixa'))[0].disabled = true;
                var myEl = angular.element( document.querySelector( '#opencaixa' ) );
                myEl.addClass('dark');

        }
        else if($scope.appConfig.StatusCaixa == 2){
            if ($scope.class === "red"){
                $scope.class = "green";
            }
            else
            {
                $scope.class = "red";
                $scope.StatusCaixa = "FECHADO";
                angular.element(document.getElementById('closedcaixa'))[0].disabled = true;
                var myEl = angular.element( document.querySelector( '#closedcaixa' ) );
                myEl.addClass('dark');
            }
            
        }

        angular.element('button[name="action"]').on('click', function (event) {

            if(confirm("Deseja abrir o caixa?")){
                // desabilita e muda cor botao abrir caixa
                angular.element(document.getElementById('opencaixa'))[0].disabled = true;
                var myEl = angular.element( document.querySelector( '#opencaixa' ) );
                myEl.addClass('dark');

                // abilita e muda cor botao fechar caixa
                angular.element(document.getElementById('closedcaixa'))[0].disabled = false;
                var myEl2 = angular.element( document.querySelector( '#closedcaixa' ) );
                myEl2.removeClass('dark');

                // vefifica se o caixa esta aberto/fechado
                // 1 = fechado /  2 = aberto
                if($scope.appConfig.StatusCaixa == 2)
                {
                    ajax.post({
                        resource: '/caixa/caixa.php?c_opencaixa=1&c_vendedor='+appConfig.sessionUser
                    }).then(function (response) {
        
                        $scope.class = "green";
                        $scope.StatusCaixa = "ABERTO";
        
                        toast.success('Caixa Aberto!');

                       //salvando dados do caisa 1= aberto 
                        $scope.appConfig.sessionUser = $scope.UserName ;
                        $scope.appConfig.UserCaixa = $scope.NCaixa;
                        $scope.appConfig.StatusCaixa = 1;
 
                         ipcRenderer.send('write-config', { name: 'app', config: $scope.appConfig });
            
                    }, function (response) {
                        toast.error(response.data.errors);
                    });

                }

            }

        });

        angular.element('button[name="actionCancel"]').on('click', function (event) {
            
            if(confirm("Deseja fechar o caixa?")){

                // desabilita e muda cor botao fechar caixa
                angular.element(document.getElementById('closedcaixa'))[0].disabled = true;
                var myEl = angular.element( document.querySelector( '#closedcaixa' ) );
                myEl.addClass('dark');   

                // abilita e muda cor botao abrir caixa
                angular.element(document.getElementById('opencaixa'))[0].disabled = false;
                var myEl2 = angular.element( document.querySelector( '#opencaixa' ) );
                myEl2.removeClass('dark');

                // vefifica se o caixa esta aberto/fechado
                // 1 = fechado /  2 = aberto
                 if ($scope.appConfig.StatusCaixa == 1){

                    ajax.post({
                        resource: '/caixa/caixa.php?c_opencaixa=2&c_vendedor='+$scope.UserName
                    }).then(function (response) {
        
                        $scope.class = "red";
                        $scope.StatusCaixa = "FECHADO";
        
                        toast.success('Caixa Fechado!');

                        //salvando dados do caisa 2= fechado 
                        $scope.appConfig.sessionUser = $scope.UserName ;
                        $scope.appConfig.UserCaixa = $scope.NCaixa;
                        $scope.appConfig.StatusCaixa = 2;
 
                        ipcRenderer.send('write-config', { name: 'app', config: $scope.appConfig });
            
                    }, function (response) {
                        toast.error(response.data.errors);
                    });
                }

            }
            
        });

        
        /*$scope.refreshUser = function(master) {
            ajax.get({ resource: '/status' }).then(function (response) {
                $scope.kongStat = response.data;
                console.log(response)

                if(!master || master !== true)
                    toast.success('Timers data has been updated');

            }, function () {
                toast.error('Could not populate data');
            });

        };

        $scope.refreshUser(true);*/

    }]);
})(window.angular, app, ipcRenderer, kongConfig, appConfig);