// SPDX-License-Identifier: Apache-2.0

'use strict';

var app = angular.module('loginapp', []);

// Angular Controller
app.controller('appController', function($scope, appFactory){

	$("#login_rtnval").hide();
	$("#register_rtnval").hide();
	$("#logout_rtnval").hide();

  $scope.login = function(){
		appFactory.clogin($scope.logn, function(data){
			$scope.login_rtn = data;
			$("#login_rtnval").show();
		});
	}

	$scope.register = function(){
		appFactory.cregister($scope.reg, function(data){
			$scope.register_rtn = data;
			$("#register_rtnval").show();
		});
	}

	$scope.logininfo = function(){
		appFactory.clogininfo(function(data){
			$scope.login_data = data;
		});
	}

	$scope.logout = function(){
		appFactory.clogout(function(data){
			$scope.logout_data = data;
			$("#logout_rtnval").show();
		});
	}
});
	/*
	$scope.queryAllCragos = function(){

		appFactory.login(function(data){
			var array = [];
			for (var i = 0; i < data.length; i++){
				// parseInt(data[i].Key);
				data[i].Record.Key = (data[i].Key);
				array.push(data[i].Record);
			}
			array.sort(function(a, b) {
			    return parseFloat(a.Key) - parseFloat(b.Key);
			});
			// console.log(array);
			$scope.all_cargo = array;
		});
	}
	$scope.queryCargo = function(){

		var id = $scope.cargo_id;

		appFactory.queryCargo(id, function(data){
			$scope.query_cargo = data;
			// console.log(data);
		});
	}

	$scope.recordCargo = function(){

		appFactory.recordCargo($scope.cargo, function(data){
			$scope.create_cargo = data;
			$("#success_create").show();
		});
	}

	$scope.changeStatus = function(){

		appFactory.changeStatus($scope.cargo, function(data){
			$scope.change_status = data;
			if ($scope.change_status == "ERROR"){
				$("#error_holder").show();
				$("#success_holder").hide();
			} else{
				$("#success_holder").show();
				$("#error_holder").hide();
			}
		});
	}

});
*/

// Angular Factory
app.factory('appFactory', function($http){

	var factory = {};

	factory.clogin = function(data, callback){

		$http.post('/login/', data).success(function(output){
			callback(output)
		});

	}

	factory.cregister = function(data, callback){

		$http.post('/register/', data).success(function(output){
			callback(output)
		});

	}

	factory.clogininfo = function(callback){
    	$http.get('/logininfo/').success(function(output){
			callback(output)
		});
	}

	factory.clogout = function(callback){
    	$http.get('/logout/').success(function(output){
			callback(output)
		});
	}
	return factory;
});
