/**
 * @license =========================================================
 *          bootstrap-datetimepicker.js
 *          http://www.eyecon.ro/bootstrap-datepicker
 *          ========================================================= Copyright
 *          2012 Stefan Petre
 * 
 * Contributions: - Andrew Rowls - Thiago de Arruda
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License. =========================================================
 */

var minionModule = angular.module('sbAdminApp');

var URL= 'http://knowinminutes.com:8080';

minionModule.run(function($rootScope, $templateCache) {
    $rootScope.$on('$routeChangeStart', function(event, next, current) {
        if (typeof(current) !== 'undefined'){
            $templateCache.remove(current.templateUrl);
        }
    });

    $rootScope.isEmpty = function(item){
    	return item == undefined || item == "";
    }
});

minionModule
		.config([
				'$httpProvider',
				function($httpProvider) {
					$httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
					$httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
				} ]);

minionModule.filter('unsafe', function($sce) {
	return function(val) {
		return $sce.trustAsHtml(val);
	};
});

minionModule
		.service(
				'$utils',
				function($rootScope, $sce, $http,$state) {

					this.isNullOrEmpty=function(item){
						if(angular.isUndefined(item) || item == "")
						{
							return true;
						}
						return false;
					}
					this.alert = function(str) {
					};
					this.ajax = function(url, data, successFunction,
							errorFunction, silent) {

						if (silent == undefined) {
							silent = false;
						}

						if (!silent) {
							ajax_msg = "Please wait";

						}
						if(!angular.isUndefined($rootScope.empId) && !angular.isUndefined($rootScope.password)){
							data.empId = $rootScope.empId;
							data.password=$rootScope.password;
						}
						$http.post(url, data)
								.success(
										function(data, status, headers, config) {
											data = data;

											if ('errorcode' in data
													&& data.errorcode == "0") {
												$rootScope.warnMsg = data.warnMsg;
												$rootScope.infoMsg = data.infoMsg;
												$rootScope.alertMsg = data.alertMsg;

												if($rootScope.warnMsg != null && $rootScope.warnMsg != "") {
													$rootScope.notificationMsg = $rootScope.warnMsg;
													$rootScope.notificationTitle = "Warning";
													$rootScope.notificationIcon = "fa-exclamation-triangle";
													$rootScope.notificationLevel = "warning";
													$('#myModal').modal('show');
												}
												if($rootScope.infoMsg != null && $rootScope.infoMsg != "") {
													$rootScope.notificationMsg = $rootScope.infoMsg;
													$rootScope.notificationTitle = "Info";
													$rootScope.notificationIcon = "fa-info-circle";
													$rootScope.notificationLevel = "info";
													$('#myModal').modal('show');
												}
												if($rootScope.alertMsg != null && $rootScope.alertMsg != "") {
													$rootScope.notificationMsg = $rootScope.alertMsg;
													$rootScope.notificationTitle = "Alert";
													$rootScope.notificationIcon = "fa-exclamation-circle";
													$rootScope.notificationLevel = "primary";
													$('#myModal').modal('show');
												}
													

												if ('redirectUrl' in data
														&& data.redirectUrl != null
														&& data.redirectUrl != "") {
													console.log(data.redirectUrl);
													//window.location = data.redirectUrl;
												}
												successFunction(data);
											} else if ('errorcode' in data
													&& data.errorcode != "0") {
												$rootScope.errorMsg = data.errorMsg;
												if($rootScope.errorMsg != ""){
													$rootScope.notificationMsg = $rootScope.errorMsg;
													$rootScope.notificationTitle = "Error";
													$rootScope.notificationIcon = "fa-exclamation-triangle";
													$rootScope.notificationLevel = "danger";
													if(data.errorcode == 101){
														$state.go('login');
													}
													else{
														$('#myModal').modal('show');
													}
													
													

												}
												if (errorFunction != undefined) {
													errorFunction(data);
												}
											}
										})
								.error(
										function(data, status, headers, config) {
											$rootScope.error = config;
										});
					};

					this.error = function(str) {
					};

				});




minionModule.directive(
    'minionDatePicker',
    function() {
        return {
            require: 'ngModel',

            restrict: 'A',
            scope: {
                dateobj: '=ngModel',
                dateformat: '@format',
                disabled: '='
            },
            template:''+
                                    '<input type="text" class="form-control" uib-datepicker-popup="{{dateformat}}" readonly ng-model="dateobj"'+
                                    ' is-open="popup1.opened" datepicker-options="dateOptions" ng-required="true" close-text="Close" alt-input-formats="[\'M!/d!/yyyy\']" />'+
                                    '<span class="input-group-btn"> '+
                                        '<button class="btn btn-default" type="button" ng-click="open1()">'+
                                            '<i class="fa fa-calendar"></i>'+
                                        '</button>'+
                                    '</span>'+
                                '',

            link: function($scope, element, attrs, ngModel) {

                
			$scope.today = function() {
			    $scope.dt = new Date();
			  };
			  $scope.today();

			  $scope.clear = function() {
			    $scope.dt = null;
			  };

			  $scope.inlineOptions = {
			    customClass: getDayClass,
			    minDate: new Date(),
			    showWeeks: true
			  };

			  $scope.dateOptions = {
			    //dateDisabled: disabled,
			    formatYear: 'yy',
			    maxDate: new Date(2020, 5, 22),
			    minDate: new Date(),
			    startingDay: 1
			  };

			  // Disable weekend selection
			  function disabled(data) {
			    var date = data.date,
			      mode = data.mode;
			    return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
			  }

			  $scope.toggleMin = function() {
			    $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
			    $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
			  };

			  $scope.toggleMin();

			  $scope.open1 = function() {
			    $scope.popup1.opened = true;
			  };

			  $scope.open2 = function() {
			    $scope.popup2.opened = true;
			  };

			  $scope.setDate = function(year, month, day) {
			    $scope.dt = new Date(year, month, day);
			  };

			  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
			  $scope.format = $scope.formats[0];
			  $scope.altInputFormats = ['M!/d!/yyyy'];

			  $scope.popup1 = {
			    opened: false
			  };

			  $scope.popup2 = {
			    opened: false
			  };

			  var tomorrow = new Date();
			  tomorrow.setDate(tomorrow.getDate() + 1);
			  var afterTomorrow = new Date();
			  afterTomorrow.setDate(tomorrow.getDate() + 1);
			  $scope.events = [
			    {
			      date: tomorrow,
			      status: 'full'
			    },
			    {
			      date: afterTomorrow,
			      status: 'partially'
			    }
			  ];

			  function getDayClass(data) {
			    var date = data.date,
			      mode = data.mode;
			    if (mode === 'day') {
			      var dayToCheck = new Date(date).setHours(0,0,0,0);

			      for (var i = 0; i < $scope.events.length; i++) {
			        var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

			        if (dayToCheck === currentDay) {
			          return $scope.events[i].status;
			        }
			      }
			    }

			    return '';
			  }
        

            }
        }
    });