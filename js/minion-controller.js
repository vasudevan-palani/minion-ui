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

minionModule.controller('HeaderCtrl', function($scope, $rootScope, $utils,$state) {
	$scope.isState=function(stateName){
		return $state.current.name == stateName;
	}

	$scope.logout=function(){
		$rootScope.empId=undefined;
		$rootScope.password=undefined;
		$state.go('login');
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
		$scope._item = "add";
	}

	$scope.isAddForm = function(){
		return $scope._item == "add";
	}

	$scope.showSearchForm=function(){
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
	// $rootScope.empId = "161547";
	// $rootScope.password = "password";	

	$scope.results={};

	$scope.isFormValid=function(){
		if($utils.isNullOrEmpty($scope.data.project) && $utils.isNullOrEmpty($scope.data.poNumber)){
			return false;
		}
		return true;
	}

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
			data.po.requestedDate=Date.parse(data.po.requestedDate);
			$scope.data = data.po;
			$scope.projectId = data.po.projectId;
			var projects = $rootScope.selects.project;
			for(projectItem in projects){

				if(projects[projectItem].id == $scope.projectId){
					$scope.data.project = projects[projectItem];
				}
			}
		});
	});

	$scope.updateTotal = function(index){
		$scope.data.poRoles[index].total = $scope.data.poRoles[index].quantity * $scope.data.poRoles[index].rate;
	}

	$scope.selectPO=function(po){
		$rootScope.$broadcast('editPO',po);
	}

	$scope.deletePoRole = function(poRole,index){
		if(!angular.isUndefined(poRole.added) && poRole.added==1){
			$scope.data.poRoles.splice(index,1);
			
		}
		else{
			poRole.deleted = 1;
		}
	}
	$scope.undoDeletePoRole = function(poRole){
		poRole.deleted = undefined;
	}
	$scope.addPoRole = function(){
		$scope.data.poRoles.push({added:1});
	}

	$scope.updatePO = function(){
		$utils.ajax(URL+'/purchaseorders/update', {'po':$scope.data}, function(data) {

		});
	}

});



minionModule.controller('EffortController', function($scope, $rootScope, $utils,$state) {

	// $rootScope.empId = "161547";
	// $rootScope.password = "password";	


	$scope.getAllocations = function() {
		$utils.ajax(URL+'/allocations/index', {
			"empId" : $rootScope.empId,
			"password" : $rootScope.password
		}, function(data) {
			$scope.allocations = data.object;
		});
	};

	$scope.selectAllocation = function(allocation) {
		if(!angular.isUndefined($scope.selectedAllocation)){
			if($scope.selectedAllocation == allocation){
				$scope.selectedAllocation = undefined;
			}
		}
		$scope.selectedAllocation = allocation;
	}

	$scope.isAllocationSelected = function(){

		return !angular.isUndefined($scope.selectedAllocation);
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

		$utils.ajax(URL+'/efforts/getEfforts', reqdata, function(data) {
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

		$utils.ajax(URL+'/efforts/add', reqdata, function(data) {
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

minionModule.controller('InvoiceController', function($scope, $rootScope, $utils,$state) {
	$scope.data = {};
	$scope.data.invoiceUsers=[];


	$scope.init=function(){
		if(angular.isUndefined($rootScope.selects)){
			$rootScope.selects={};
		}
		$utils.ajax(URL+'/selects/get', {'names':["user","project","status"]}, function(data) {
			$rootScope.selects.user = data.list.user;
			$rootScope.selects.project = data.list.project;
			$rootScope.selects.status = data.list.status;
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
		$scope._item = "add";
	}

	$scope.isAddForm = function(){
		return $scope._item == "add";
	}

	$scope.showSearchForm=function(){
		$scope._item = "search";
	}

	$scope.isSearchForm = function(){
		return $scope._item == "search";
	}


	$scope.$on('editInvoice',function(event,data){
		$scope._item = "edit";
	});

	$scope.addInvoice = function(){

		if(!angular.isUndefined($scope.data.project)){
			$scope.data.projectId = $scope.data.project.id;
		}
		if(!angular.isUndefined($scope.data.status)){
			$scope.data.statusId = $scope.data.status.id;
		}

		for(userIndex in $scope.data.invoiceUsers){
			$scope.data.invoiceUsers[userIndex].userId = $scope.data.invoiceUsers[userIndex].user.id;
		}

		$utils.ajax(URL+'/invoice/add', {'invoice':$scope.data}, function(data) {

		});
	}

	$scope.addUser = function(){
		$scope.data.invoiceUsers.push({});
	}

	$scope.deleteUser = function(index){
		$scope.data.invoiceUsers.splice(index,1);
	}

	$scope.updateTotal = function(index){
		$scope.data.invoiceUsers[index].total = $scope.data.invoiceUsers[index].hours * $scope.data.invoiceUsers[index].billingRate;
		$scope.data.total = 0; 
		for(userIndex in $scope.data.invoiceUsers){
			$scope.data.total = $scope.data.total + $scope.data.invoiceUsers[userIndex].total;
		}
	}



});


minionModule.controller('AddInvoiceController', function($scope, $rootScope, $utils,$state) {
	$scope.data = {};
	$scope.data.invoiceUsers=[];


	$scope.addInvoice = function(){

		if(!angular.isUndefined($scope.data.project)){
			$scope.data.projectId = $scope.data.project.id;
		}
		if(!angular.isUndefined($scope.data.status)){
			$scope.data.statusId = $scope.data.status.id;
		}

		for(userIndex in $scope.data.invoiceUsers){
			$scope.data.invoiceUsers[userIndex].userId = $scope.data.invoiceUsers[userIndex].user.id;
		}

		$utils.ajax(URL+'/invoice/add', {'invoice':$scope.data}, function(data) {

		});
	}

	$scope.addUser = function(){
		$scope.data.invoiceUsers.push({});
	}

	$scope.deleteUser = function(index){
		$scope.data.invoiceUsers.splice(index,1);
	}

	$scope.updateTotal = function(index){
		$scope.data.invoiceUsers[index].total = $scope.data.invoiceUsers[index].hours * $scope.data.invoiceUsers[index].billingRate;
		$scope.data.total = 0; 
		for(userIndex in $scope.data.invoiceUsers){
			$scope.data.total = $scope.data.total + $scope.data.invoiceUsers[userIndex].total;
		}
	}



});


minionModule.controller('SearchInvoiceController', function($scope, $rootScope, $utils,$state) {
	$rootScope.empId = "161547";
	$rootScope.password = "password";	

	$scope.results={};

	$scope.isFormValid=function(){
		if($utils.isNullOrEmpty($scope.data.project) && $utils.isNullOrEmpty($scope.data.poNumber)){
			return false;
		}
		return true;
	}

	$scope.searchInvoice = function(){
		if(!angular.isUndefined($scope.data.project)){
			$scope.data.projectId = $scope.data.project.id;
		}
		
		if(!angular.isUndefined($scope.data.status)){
			$scope.data.statusId = $scope.data.status.id;
		}

		$utils.ajax(URL+'/invoice/search', $scope.data, function(data) {
			$scope.results.invoices = data.invoices;
		});
	}

	$scope.selectInvoice=function(invoice){
		$rootScope.$broadcast('editInvoice',invoice);
	}


});

minionModule.controller('EditInvoiceController', function($scope, $rootScope, $utils,$state) {

	$scope.edit={};

	$scope.isDeleted = function(invoiceUser){
		if(angular.isUndefined(invoiceUser.deleted)){
			return false;
		}
		else if (invoiceUser.deleted == 1){
			return true;
		}
		else{
			return false;
		}
	}

	$scope.$on('editInvoice',function(event,data){
		$scope.data = data;

		$utils.ajax(URL+'/invoice/get', {'empId':$rootScope.empId,'password':$rootScope.password,'invoiceId':data.id}, function(data) {
			data.invoice.invoiceDate=Date.parse(data.invoice.invoiceDate);
			data.invoice.startDate=Date.parse(data.invoice.startDate);
			data.invoice.endDate=Date.parse(data.invoice.endDate);

			$scope.data = data.invoice;
			$scope.projectId = data.invoice.projectId;
			var projects = $rootScope.selects.project;
			for(projectItem in projects){

				if(projects[projectItem].id == $scope.projectId){
					$scope.data.project = projects[projectItem];
				}
			}
			$scope.data.statusId = data.invoice.statusId;
			var status = $rootScope.selects.status;
			for(statusItem in status){


				if(status[statusItem].id == $scope.data.statusId){
					$scope.data.status = status[statusItem];
				}
			}

			var invoiceUsers = data.invoice.invoiceUsers;
			var users = $rootScope.selects.user;
			for(invoiceUserItemIndex in invoiceUsers){

				for(userItemIndex in users){
					if(invoiceUsers[invoiceUserItemIndex].userId == users[userItemIndex].id){
						invoiceUsers[invoiceUserItemIndex].user = users[userItemIndex];
					}					
				}
			}


		});
	});

	$scope.updateTotal = function(index){
		$scope.data.invoiceUsers[index].total = $scope.data.invoiceUsers[index].hours * $scope.data.invoiceUsers[index].billingRate;
		$scope.data.total = 0; 
		for(userIndex in $scope.data.invoiceUsers){
			$scope.data.total = $scope.data.total + $scope.data.invoiceUsers[userIndex].total;
		}
	}

	$scope.selectInvoice=function(invoice){
		$rootScope.$broadcast('editInvoice',invoice);
	}

	$scope.deleteInvoiceUser = function(invoiceUser,index){
		if(!angular.isUndefined(invoiceUser.added) && invoiceUser.added==1){
			$scope.data.invoiceUsers.splice(index,1);
			
		}
		else{
			invoiceUser.deleted = 1;
		}
	}
	$scope.undoDeleteInvoiceUser = function(invoiceUser){
		invoiceUser.deleted = undefined;
	}
	$scope.addInvoiceUser = function(){
		$scope.data.invoiceUsers.push({added:1});
	}

	$scope.updateInvoice = function(){
		$utils.ajax(URL+'/invoice/update', {'invoice':$scope.data}, function(data) {

		});
	}

});
