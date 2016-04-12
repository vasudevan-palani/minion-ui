minionModule.controller('LoginController', function($scope, $rootScope, $utils,$state) {
	$scope.data = {};

	$scope.login = function() {
		$utils.ajax('http://localhost:8080/users/login', $scope.data, function(data) {
			$rootScope.creds = data.data;
			$rootScope.empId = $scope.data.empId;
			$rootScope.password = $scope.data.password;
			$state.go('dashboard.effort');
		});
	}
});


minionModule.controller('EffortController', function($scope, $rootScope, $utils,$state) {

	// $rootScope.empId = "161547";
	// $rootScope.password = "password";	

	$scope.debug = function(){
		console.log($scope.startDate);
		console.log($scope.endDate);
	}

	$scope.getAllocations = function() {
		$utils.ajax('http://localhost:8080/allocations/index', {
			"empId" : $rootScope.empId,
			"password" : $rootScope.password
		}, function(data) {
			$scope.allocations = data.object;
		});
	};

	$scope.selectAllocation = function(allocation) {
		$scope.selectedAllocation = allocation;
	}

	// $scope.toDate = function(dateStr) {
	// 	var parts = dateStr.split("-");
	// 	return new Date(parts[0], parts[1] - 1, parts[2]);
	// }

	// $scope.search.submit = function() {
	// 	$utils.ajax('/minion/efforts/search.json', $scope.search.data,
	// 			function(data) {
	// 				$scope.results = data.data;
	// 			});
	// }
	$scope.dateRange = [];
	// $scope.$watch('startdate', function(newVal, oldVal) {
	// 	$scope.updateDates();
	// });

	// $scope.$watch('enddate', function(newVal, oldVal) {
	// 	$scope.updateDates();
	// });

	Date.prototype.yyyymmdd = function() {
		var yyyy = this.getFullYear().toString();
		var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
		var dd = this.getDate().toString();
		return yyyy + "-" + (mm[1] ? mm : "0" + mm[0]) + "-"
				+ (dd[1] ? dd : "0" + dd[0]); // padding
	};

	$scope.updateDates = function() {

		if(angular.isUndefined($scope.selectedAllocation)){
			return;
		}
		var reqdata = {
				"allocationId" : $scope.selectedAllocation.id,
				"empId" : $rootScope.empId,
				"password" : $rootScope.password,
				"startDate" : $scope.startDate,
				"endDate":$scope.endDate
		};

		$utils.ajax('http://localhost:8080/efforts/getEfforts', reqdata, function(data) {
			$scope.effortData= data.object;

			if ($scope.startDate != null && $scope.endDate != null
					&& $scope.startDate <= $scope.endDate) {
				$scope.dateRange.splice(0, $scope.dateRange.length);

				var start = new Date($scope.startDate);
				var end = new Date($scope.endDate);

				while (start <= end) {

					var effortDataItem = {date:start.yyyymmdd(),effort:"0"};
					for (var int = 0; !angular.isUndefined($scope.effortData) && int < $scope.effortData.length; int++) {

						if($scope.effortData[int].date == start.yyyymmdd()){
							effortDataItem.effort=$scope.effortData[int].effort;
						}
					}
					$scope.dateRange.push(effortDataItem);						
					
					var newDate = start.setDate(start.getDate() + 1);
					start = new Date(newDate);
				}
				console.log($scope.dateRange);
				$scope.$broadcast('dateRangeUpdated');

			}
		});
	}	
			
	$scope.addEfforts = function() {
		var reqdata = {
			"allocationId" : $scope.selectedAllocation.id,
			"empId" : $rootScope.empId,
			"password" : $rootScope.password,
			"efforts" : $scope.dateRange
		};

		$utils.ajax('http://localhost:8080/efforts/add', reqdata, function(data) {
			$scope.results = data.data;
		});
	}
});




minionModule.controller('AddEffortController', function($scope, $rootScope, $utils,$state) {

	$scope.PAGE_LENGTH = 9;

	$scope.currentStartIndex = 0;
	
	$scope.currentEndIndex = 8;
	$scope.currentDateRange = [];

	$scope.$on('dateRangeUpdated',function(){
		$scope.currentStartIndex = 0;

		if($scope.dateRange.length < $scope.PAGE_LENGTH){
			$scope.currentEndIndex = $scope.dateRange.length-1;
		}
		$scope.refresh();
	});

	$scope.refresh = function(){
		$scope.currentDateRange.splice(0, $scope.currentDateRange.length);
		console.log($scope.currentStartIndex);
		console.log($scope.currentEndIndex);
		for (var i = $scope.currentStartIndex; i <= $scope.currentEndIndex; i++) {

			$scope.currentDateRange.push($scope.dateRange[i]);
		};		
	}

	$scope.increment = function(){

		if( ($scope.currentEndIndex + $scope.PAGE_LENGTH) > $scope.dateRange.length -1 ){
			$scope.currentEndIndex = $scope.dateRange.length - 1;
		}
		else {
			$scope.currentEndIndex = $scope.currentEndIndex + $scope.PAGE_LENGTH;
		}

		$scope.currentStartIndex = $scope.currentEndIndex - $scope.PAGE_LENGTH +1;
		if($scope.currentStartIndex < 0 ){
			$scope.currentStartIndex = 0;
		}

		$scope.refresh();
	}

	$scope.decrement = function(){
		$scope.currentStartIndex = $scope.currentStartIndex - $scope.PAGE_LENGTH ;
		if($scope.currentStartIndex < 0 ){
			$scope.currentStartIndex = 0;
		}
		$scope.currentEndIndex = $scope.currentStartIndex + $scope.PAGE_LENGTH - 1;
		if($scope.currentEndIndex > $scope.dateRange.length -1){
			$scope.currentEndIndex = $scope.dateRange.length -1;
		}

		$scope.refresh();
	}

	$scope.isIncrementDisabled = function(){
		return $scope.currentEndIndex >= $scope.dateRange.length-1;
	}
	$scope.isDecrementDisabled = function(){
		return $scope.currentStartIndex == 0;
	}
});