/* global app:true */
(function(angular, app) { 'use strict';
    const controller = 'UpstreamListController';
    const openAboutWindow = require('about-window').default;
    const join = require('path').join;

    if (typeof app === 'undefined') throw (controller + ': app is undefined');

    app.controller(controller, ['$scope', 'ajax', 'viewFactory', 'toast', function ($scope, ajax, viewFactory, toast) {
        viewFactory.title = 'Sobre';
        viewFactory.prevUrl = null;

        /*openAboutWindow({
            icon_path: join(__dirname, 'icon.png'),
            copyright: 'Copyright (c) 2017 Gabriel Carlos',
            open_devtools: process.env.NODE_ENV !== 'production',
        })*/


        


    }]);
})(window.angular, app);