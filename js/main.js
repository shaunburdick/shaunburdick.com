(function() {
  'use strict';

  var app = angular.module('sb', ['ui.router', 'ui.bootstrap']);

  app.config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
      $urlRouterProvider.otherwise('/');

      $stateProvider
        .state('home', {
          url:'/',
          templateUrl: 'home'
        })
        .state('personal', {
          url:'/personal',
          templateUrl: 'personal'
        })
        .state('professional', {
          url:'/professional',
          templateUrl: 'professional'
        });
    }
  ]);

  app.controller('MenuCtrl', ['$scope', '$state',
    function($scope, $state) {
      $scope.$state = $state;
      $scope.emailHash = (Math.random()+1).toString(36)
                                          .replace(/[^\w]/, '');
      $scope.collapse = true;
    }
  ]);

  app.controller('SkillsCtrl', ['$scope',
    function($scope) {
      $scope.skills = [
        {name: 'PHP', comfort: '95'},
        {name: 'AngularJs', comfort: '75'},
        {name: 'jQuery', comfort: '75'},
        {name: 'Javascript', comfort: '75'},
        {name: 'CSS', comfort: '65'},
        {name: 'Bootstrap', comfort: '50'},
        {name: 'MySQL', comfort: '80'},
        {name: 'Perl', comfort: '40'},
        {name: 'LAMP Administration', comfort: '50'},
        {name: 'NodeJS', comfort: '30'},
        {name: 'Neo4J', comfort: '10'},
        {name: 'Scrum', comfort: '80'}
      ];
    }
  ]);
}());