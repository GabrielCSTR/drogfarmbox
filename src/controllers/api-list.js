/* global app:true appConfig:true*/
(function (angular, app, appConfig) { 'use strict';

    const controller = 'ApiListController';
    if (typeof app === 'undefined') throw (controller + ': app is undefined');
    
    app.controller(controller, ['$scope', 'ajax', 'toast', 'viewFactory', '$interval', function ($scope, ajax, toast, viewFactory, $interval) {
        
        viewFactory.title = 'Caixa';
        viewFactory.prevUrl = null;

        /**
         * Dados do form enviado
         */
        $scope.formInput = {
            vcompra: '',
            client: ''
        };

        /**
         * Pegando dados Usuario logado
         */
        $scope.UserName = appConfig.sessionUser;
        $scope.NCaixa = appConfig.UserCaixa;
        $scope.StatusCaixa = appConfig.StatusCaixa;

        /**
         * Verificando se o caixa esta fechado
         * StatusCaixa = 2 (fechado)
         */
        if($scope.StatusCaixa == 2)
        {

            alert("CAIXA FECHADO, Por favor abra o caixa!!");
            window.location.href = 'index.html';
            
        }



        /**
         * Variaveis importantes
         * amout = numero de vendas
         * apiList = lista de vendas
         * vendaList = vendas que do dia q sao adicionada no apiList
         */
        $scope.amount = 0;
        $scope.apiList = [];
        $scope.vendaList = [];

        let panelListCaixa = angular.element('div#panelListCaixa');
        let apiTable = panelListCaixa.children('div.panel__body').children('table');

        let panelAdd = angular.element('div#panelCaixa');
        let apiForm = panelAdd.children('div.panel__body').children('form');
        

        let table = angular.element('table#apiTable');

        $scope.refreshDb = function(master) {
            // Limpando lista atual da tabela
            $scope.apiList = [];
            
            toast.success('Atualizado lista de venda!');
            $scope.fetchApiList('/caixa');
            
        };

        /*table.on('click', 'i.state-highlight', function (event) {
            let icon = angular.element(event.target);
            let payload = {};
            let attribute = icon.data('attribute');

            payload[attribute] = !(icon.hasClass('success'));
            
            ajax.patch({
                resource: '/caixa/' + icon.data('api-id'),
                data: payload
            }).then(function () {
                if (payload[attribute] === true) {
                    icon.removeClass('default').addClass('success');

                } else {
                    icon.removeClass('success').addClass('default');
                }

                toast.success('Attribute ' + attribute + ' set to ' + payload[attribute]);

                console.log(icon)
                console.log(payload)

            }, function () {
                toast.error('Unable to update ' + attribute);
            });
        });*/
        
        panelAdd.children('div.panel__heading').on('click', function () {
            apiForm.slideToggle(300);
        });

        panelListCaixa.children('div.panel__heading').on('click', function () {
            apiTable.slideToggle(300);
        });

        $scope.totallist = 0;

        /**
         * Carregando vendas do dia do vendedor
         * @param {*dados da api caixa} response 
         */
        $scope.fetchApiList = function (response) {

            // Limpando lista atual da tabela
            $scope.apiList = [];

            /**
             * formata o numero para valor $REAL
             * @param {*} number 
             * @param {*} decimals 
             * @param {*} dec_point 
             * @param {*} thousands_point 
             */
            function number_format(number, decimals, dec_point, thousands_point) {
                
                    if (number == null || !isFinite(number)) {
                        throw new TypeError("number is not valid");
                    }
                
                    if (!decimals) {
                        var len = number.toString().split('.').length;
                        decimals = len > 1 ? len : 0;
                    }
                
                    if (!dec_point) {
                        dec_point = '.';
                    }
                
                    if (!thousands_point) {
                        thousands_point = ',';
                    }
                
                    number = parseFloat(number).toFixed(decimals);
                
                    number = number.replace(".", dec_point);
                
                    var splitNum = number.split(dec_point);
                    splitNum[0] = splitNum[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands_point);
                    number = splitNum.join(dec_point);
                
                    return number;
            }

            // carrega vendas do dia
            ajax.get({
                resource: response + '/index.php?v_vendedor='+ $scope.UserName
                //data: payload
                }).then(function (response) {

                //dados vendedor
                var result = response.data;
                //console.log(response.data)
                for(var i = 0, len = result.length; i < len; i++)
                {
                    var venda = number_format(result[i].Total, 2, ',', '.');
                    var Vstatus = false;

                    if(result[i].status == "true"){
                        Vstatus = true;
                    }

                    $scope.vendaList = {
                        id : i,
                        data: result[i].Date,
                        vendedor : result[i].vendedor,
                        caixa: result[i].caixa,
                        client: result[i].Client,
                        venda: venda,
                        status: Vstatus,
                        idvenda: result[i].id
                    };

                    
                    $scope.apiList.push($scope.vendaList);
                    $scope.totallist = i;
                }
                
                

            }, function () {
                toast.error('Could not load list of APIs');
            });
        };

        /**
         * Submit do form
         */
        apiForm.on('submit', function (event) {
            event.preventDefault();

            let payload = {};
            
            payload.vcompra = $scope.amount;
            payload.client = $scope.formInput.client;

            if ($scope.formInput.client.trim().length > 1) {
                payload.client = $scope.formInput.client;
            }
            else {
                apiForm.find('input[name="client"]').focus();
                return false;
            }

            /**
             * Receendo dados da venda do form e 
             * Enviado vendas para DB
             */
            ajax.post({
                resource: '/caixa/add.php?c_vcompra='+payload.vcompra+'&c_client='+payload.client+'&v_vendedor='+$scope.UserName+'&v_caixa='+$scope.NCaixa,
                data: payload
            }).then(function (response) {
                // id produto
                response.data.id = $scope.totallist + 1;
                // adicionando dados list
                //console.log(response.data)
                $scope.apiList.push(response.data);

                $scope.amount = '';
                $scope.formInput.client = '';

                toast.success('Compra cliente: \'' + payload.client + '\' foi adicionada');

            }, function (response) {
                toast.error(response.data.errors);
            });

            return false;
        });

        apiForm.on('click', 'button[name="actionCancel"]', function () {
            apiForm.slideUp(300);
        });

        /**
         * Verifica venda do dia
         */
        var callAtTimeout = function () {
            $scope.fetchApiList('/caixa');
        }
        $scope.fetchApiList('/caixa');
        //$interval(callAtTimeout, 5000);
    }]);

    
  /**
   * trasnfomado os numero informado da venda em REAL
   * Diretide 
   * input focus
   */
  app.directive('inputCurrency', ['$locale', '$filter', function($locale, $filter) {
    
        // For input validation
        var isValid = function(val) {
          return angular.isNumber(val) && !isNaN(val);
        };
    
        // Helper for creating RegExp's
        var toRegExp = function(val) {
          var escaped = val.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          return new RegExp(escaped, 'g');
        };
    
        // Saved to your $scope/model
        var toModel = function(val) {
    
          // Locale currency support
          var decimal = toRegExp($locale.NUMBER_FORMATS.DECIMAL_SEP);
          var group = toRegExp($locale.NUMBER_FORMATS.GROUP_SEP);
          var currency = toRegExp($locale.NUMBER_FORMATS.CURRENCY_SYM);
    
          // Strip currency related characters from string
          val = val.replace(decimal, '').replace(group, '').replace(currency, '').trim();
    
          return parseInt(val, 10);
        };
    
        // Displayed in the input to users
        var toView = function(val) {
          return $filter('currency')(val, '$', 0);
        };
    
        // Link to DOM
        var link = function($scope, $element, $attrs, $ngModel) {
          $ngModel.$formatters.push(toView);
          $ngModel.$parsers.push(toModel);
          $ngModel.$validators.currency = isValid;
    
          $element.on('keyup', function() {
            $ngModel.$viewValue = toView($ngModel.$modelValue);
            $ngModel.$render();
          });
        };
    
        return {
          restrict: 'A',
          require: 'ngModel',
          link: link
        };
      }]);

})(window.angular, app, appConfig);