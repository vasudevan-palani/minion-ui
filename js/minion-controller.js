minionModule.controller('LoginController', function($scope, $rootScope, $utils,$state) {
	$scope.data = {};

	$scope.login = function() {

		// $utils.ajax('https://sit1api.tracfone.com/oauth/cc', 'grant_type=client_credentials&scope=linkAccount&client_id=SMAppMyAcct_CCP&client_secret=abc123**&&brandName=STRAIGHT_TALK&sourceSystem=APP', function(data) {
		// 	$rootScope.creds = data.data;
		// 	$rootScope.empId = $scope.data.empId;
		// 	$rootScope.password = $scope.data.password;
		// 	$state.go('dashboard.effort');
		// });

		$utils.ajax(URL+'/users/login', $scope.data, function(data) {
			$rootScope.creds = data.data;
			$rootScope.empId = $scope.data.empId;
			$rootScope.password = $scope.data.password;
			$state.go('dashboard.effort');
		});
	}
});

minionModule.controller('PurchaseOrderController', function($scope, $rootScope, $utils,$state) {
	$scope.data = {};
	$scope.data.poRoles=[];

	$scope.init=function(){
		if(angular.isUndefined($rootScope.selects)){
			$rootScope.selects={};
		}
		$utils.ajax(URL+'/selects/get', {'names':["project"]}, function(data) {
			$rootScope.selects.project = data.list.project;
		});
		$scope.showSearchForm();
	}

	$scope.showEditForm=function(){

		$scope._item = "edit";
	}

	$scope.isEditForm = function(){
		return $scope._item == "edit";
	}

	$scope.showAddForm=function(){
		console.log("here");
		$scope._item = "add";
	}

	$scope.isAddForm = function(){
		return $scope._item == "add";
	}

	$scope.showSearchForm=function(){
		console.log("here");
		$scope._item = "search";
	}

	$scope.isSearchForm = function(){
		return $scope._item == "search";
	}


	$scope.$on('editPO',function(event,data){
		$scope._item = "edit";
	});

	$scope.addPurchaseOrder = function(){
		$scope.data.empId = $rootScope.empId;
		$scope.data.password = $rootScope.password;
		if(!angular.isUndefined($scope.data.project)){
			$scope.data.projectId = $scope.data.project.id;
		}

		$utils.ajax(URL+'/purchaseorders/add', $scope.data, function(data) {

		});
	}

	$scope.addPoRole = function(){
		$scope.data.poRoles.push({});
	}

	$scope.deletePoRole = function(index){
		$scope.data.poRoles.splice(index,1);
	}

	$scope.updateTotal = function(index){
		$scope.data.poRoles[index].total = $scope.data.poRoles[index].quantity * $scope.data.poRoles[index].rate;
	}



});

minionModule.controller('SearchPurchaseOrderController', function($scope, $rootScope, $utils,$state) {
	$rootScope.empId = "161547";
	$rootScope.password = "password";	

	$scope.results={};

	$scope.searchPurchaseOrder = function(){
		$scope.data.empId = $rootScope.empId;
		$scope.data.password = $rootScope.password;
		if(!angular.isUndefined($scope.data.project)){
			$scope.data.projectId = $scope.data.project.id;
		}
		
		$utils.ajax(URL+'/purchaseorders/search', $scope.data, function(data) {
			$scope.results.pos = data.pos;
		});
	}

	$scope.selectPO=function(po){
		console.log("here");
		$rootScope.$broadcast('editPO',po);
	}
});

minionModule.controller('EditPurchaseOrderController', function($scope, $rootScope, $utils,$state) {

	$scope.edit={};

	$scope.isDeleted = function(poRole){
		if(angular.isUndefined(poRole.deleted)){
			return false;
		}
		else if (poRole.deleted == 1){
			return true;
		}
		else{
			return false;
		}
	}

	$scope.$on('editPO',function(event,data){
		$scope.data = data;

		$utils.ajax(URL+'/purchaseorders/get', {'empId':$rootScope.empId,'password':$rootScope.password,'poId':data.id}, function(data) {
			data.po.requestedDate=new Date(data.po.requestedDate);
			$scope.data = data.po;
			$scope.projectId = data.po.projectId;
			var projects = $rootScope.selects.project;
			for(projectItem in projects){

				if(projects[projectItem].id == $scope.projectId){
					$scope.data.project = projects[projectItem];
					console.log($scope.data.project);
				}
			}
		});
	});

	$scope.selectPO=function(po){
		$rootScope.$broadcast('editPO',po);
	}

	$scope.deletePoRole = function(poRole,index){
		if(angular.isUndefined(poRole.added)){
			poRole.deleted = 1;
		}
		else{
			$scope.data.poRoles.splice(index,1);
		}
	}
	$scope.undoDeletePoRole = function(poRole){
		poRole.deleted = undefined;
	}
	$scope.addPoRole = function(){
		$scope.data.poRoles.push({added:1});
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
		$utils.ajax(URL+'/allocations/index', {
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

		$utils.ajax('http://knowinminutes.com:8080/efforts/getEfforts', reqdata, function(data) {
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

		$utils.ajax('http://knowinminutes.com:8080/efforts/add', reqdata, function(data) {
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