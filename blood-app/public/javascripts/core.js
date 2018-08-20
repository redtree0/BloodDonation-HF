// SPDX-License-Identifier: Apache-2.0

'use strict';

var app = angular.module('application', []);

// Angular Controller
app.controller('appController', function($scope, appFactory){

	$("#success_holder").hide();
	$("#success_create").hide();
	$("#error_holder").hide();
	$("#error_query").hide();
	
	$scope.queryCardAll = function(){

		appFactory.queryCardAll(function(data){
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

	$scope.queryCardOwner = function(){

		var id = $scope.card_id;

		appFactory.queryCardOwner(id, function(data){

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
			$scope.all_query_cargo = array;

			// $scope.query_card = data;
			// console.log(data);
			// if ($scope.query_card == "ERROR"){
			// 	$("#error_query").show();
			// } else{
			// 	$("#error_query").hide();
			// }
		});
	}

	$scope.queryCardDate = function(){

		var id = $scope.card_id;

		appFactory.queryCardDate(id, function(data){

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
			$scope.all_query_cargo = array;

		});
	}

	$scope.queryCardType = function(){

		var id = $scope.card_id;

		appFactory.queryCardDate(id, function(data){

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
			$scope.all_query_cargo = array;

		});
	}



	$scope.recordCard = function(){

		appFactory.recordCard($scope.card, function(data){
			$scope.create_card = data;
			console.log(data);
			$("#success_create").show();
		});
	}

	$scope.useCard = function(){

		appFactory.useCard($scope.card, function(data){
			$scope.use_status = data;
			if ($scope.use_status == "ERROR"){
				$("#error_holder").show();
				$("#success_holder").hide();
			} else{
				$("#success_holder").show();
				$("#error_holder").hide();
			}
		});
	}

	$scope.donateCard = function(){

		appFactory.donateCard($scope.dcard, function(data){
			$scope.donate_status = data;
			if ($scope.donate_status == "ERROR"){
				$("#error_holder").show();
				$("#success_holder").hide();
			} else{
				$("#success_holder").show();
				$("#error_holder").hide();
			}
		});
	}

});

// Angular Factory
app.factory('appFactory', function($http){
	
	var factory = {};

    factory.queryCardAll = function(callback){

    	$http.get('/card/all/').success(function(output){
			callback(output)
		});
	}

	factory.queryCardOwner = function(id, callback){
    	$http.get('/card/owner/'+id).success(function(output){
			callback(output)
		});
	}

	factory.queryCardDate = function(id, callback){
    	$http.get('/card/date/'+id).success(function(output){
			callback(output)
		});
	}

	factory.queryCardType = function(id, callback){
    	$http.get('/card/bloodType/'+id).success(function(output){
			callback(output)
		});
	}


	factory.recordCard = function(data, callback){
		$http.post('/createCard/', data).success(function(output){
			callback(output)
		});
	}

	factory.useCard = function(data, callback){
		$http.post('/useCard/', data).success(function(output){
			callback(output)
		});
	}

	factory.donateCard = function(data, callback){
		$http.post('/donateCard/', data).success(function(output){
			callback(output)
		});
	}

	return factory;
});


