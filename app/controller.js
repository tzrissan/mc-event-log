var _ = require('../bower_components/underscore/underscore-min.js');

angular.module('mcEventLog', [])
.controller('InputFormCtrl', function($scope, Data, DataTable, Utils) {

	'use strict';

	$scope.isSaving = false;

	var resetForm = function() {
		$scope.line = {
			date: Utils.date2str(new Date()),
			info: "Hki kaupunkiajoa"
		};
	};

	resetForm();

	$scope.sendForm = function(line) {
		$scope.isSaving = true;
		Data.addLine(line, function() {
			resetForm();
			$scope.isSaving = false;
		});
	};

})
.controller('DataTableCtrl', function($scope, $rootScope, DataTable, LocalStorage, Data, Utils, StatisticsUtil) {

	'use strict';

	$scope.showDate = true;
	$scope.showMonth = true;
	$scope.showYear = true;

	var updateLines = function() {
		DataTable.setRawData(Data.getItems($scope.bike));
		$scope.lines = DataTable.lines();
		$scope.stats = { 
			Tankkaukset: StatisticsUtil.countFuelStats($scope.lines.Tankkaukset),
			Renkaat: StatisticsUtil.countTyreStats(DataTable.getRawData().tyres, DataTable.maxOdo()),
			Huollot: StatisticsUtil.countMaintenanceStats(DataTable.getRawData().maintenance, DataTable.maxOdo()),
			Kaudet: StatisticsUtil.countSeasonStats(DataTable.getRawData().seasons)
		};
	};

	$scope.$on('raw-data-was-updated', function() {
		updateLines();
	});

	var updateVisibilities = function(level) {
		switch (level) {
			case undefined: 
			case 'items': 
			case 'days': 
				$scope.showDate = true;
				$scope.showMonth = true;
				$scope.showYear = true;
				break;
			case 'months': 
				$scope.showDate = false;
				$scope.showMonth = true;
				$scope.showYear = true;
				break;
			case 'years': 
				$scope.showDate = false;
				$scope.showMonth = false;
				$scope.showYear = true;
				break;
			default: 
				alert('Err: unknown level: ' + level);
		}
	};

	var toDateSelector = function(level, date) {
		var dateStr = Utils.toDateString(date);
		switch (level) {
			case 'day': 
				return parseInt(Utils.str2day(dateStr));
			case 'month': 
				return parseInt(Utils.str2month(dateStr));
			case 'year': 
				return parseInt(Utils.str2year(dateStr));
			default: 
				return undefined;
		}	
	};

	var modifySelected = function(level, originalValue, delta) {
		switch (level) {
			case 'day': 
				return ((30 + originalValue + delta) % 31) + 1;
			case 'month': 
				return ((11 + originalValue + delta) % 12) + 1;
			case 'year': 
				return (originalValue + delta);
			default: 
		}
	};

	var setSummmaryLevel = function(level) {
		updateVisibilities(level);
		DataTable.setSummmaryLevel(level);
		updateLines();
	};

	$scope.showStats=false;
	$scope.setShowStats=function(val) { 
		$scope.showStats = val; 
	};

	$scope.summarize = function(level) {
		if (DataTable.isSummmaryLevel(level)) {
			setSummmaryLevel('items');
		} else {
			setSummmaryLevel(level);
		}
	};

	$scope.isSummarizedBy = function(level) {
		return DataTable.isSummmaryLevel(level);
	};

	$scope.select = function(level, date) {
		var dateObject = Utils.str2date(Utils.toDateString(date));
		var selector = toDateSelector(level, dateObject);
		DataTable.toggleSelected(level, selector);
		updateLines();
	};

	$scope.selectNext = function(level) {
		var selected = DataTable.getSelected(level);
		DataTable.toggleSelected(level, modifySelected(level, selected, 1));
		updateLines();
	};

	$scope.selectPrev = function(level) {
		var selected = DataTable.getSelected(level);
		DataTable.toggleSelected(level, modifySelected(level, selected, -1));
		updateLines();
	};

	$scope.unSelect = function(level, date, direction) {
		DataTable.toggleSelected(level);
		updateLines();
	};

	$scope.hasSelected = function(level) {
		return DataTable.hasSelected(level);
	};

	$scope.orderBy = function(field) {
		DataTable.orderBy(field);
		updateLines();
	};

	$scope.isOrderedBy = function(field) {
		return DataTable.isOrderedBy(field);
	};

	$scope.toggleDetails = function(line) {
		line.showDetailedInfo = !line.showDetailedInfo;
	};

	$scope.canSelectPrev = function(level, value) {
		return DataTable.hasSelected(level) && true;
	};

	$scope.canSelectNext = function(level, value) {
		return DataTable.hasSelected(level) && true;
	};

	$scope.getSelected = function(level) {
		return DataTable.getSelected(level);
	};

	$scope.tabs = [ 'Tankkaukset', 'Renkaat', 'Huollot', 'Kaudet', 'Muut' ];
	$scope.tab = $scope.tabs[0];
	$scope.selectTab = function(tab) {
		$scope.tab = tab;
	};
	$scope.isTab = function(tab) {
		return $scope.tab == tab;
	};

	$scope.maxodo=Data.maxValues.odo;
	$scope.lastfront=_.chain(Data.getItems())
										.filter(function(item) { return item.type=='TYRE_FRONT'; })
										.pluck('odo')
										.max()
										.value();
	$scope.lastrear= _.chain(Data.getItems())
										.filter(function(item) { return item.type=='TYRE_REAR'; })
										.pluck('odo')
										.max()
										.value();

	$scope.lastmaintenance = _.chain(Data.getItems())
														.filter(function(item) { return item.type=='MAINTENANCE'; } )
                            .pluck('odo')
                            .max()
                            .value();

	$scope.reload = function() {
		Data.reload();
	};

	updateLines();

	Data.loadNewData(function() {
		updateLines();
	});


});