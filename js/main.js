(function () {
  "use strict";

  var app = angular.module("sb", ["ui.router", "ui.bootstrap"]);

  app.config([
    "$stateProvider",
    "$urlRouterProvider",
    function ($stateProvider, $urlRouterProvider) {
      $urlRouterProvider.otherwise("/");

      $stateProvider
        .state("home", {
          url: "/",
          templateUrl: "home",
        })
        .state("personal", {
          url: "/personal",
          templateUrl: "personal",
        })
        .state("professional", {
          url: "/professional",
          templateUrl: "professional",
        });
    },
  ]);

  app.controller("MenuCtrl", [
    "$scope",
    "$state",
    function ($scope, $state) {
      $scope.$state = $state;
      $scope.emailHash = (Math.random() + 1).toString(36).replace(/[^\w]/, "");
      $scope.email = $scope.emailHash + "-site@shaunburdick.com";
      $scope.collapse = true;
    },
  ]);
})();
