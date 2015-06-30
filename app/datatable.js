var _ = require('../bower_components/underscore/underscore-min.js');

angular.module('mcEventLog').factory('DataTableSummaryUtils', function(Utils) {

	'use strict';

	var summarizeData = function(level, data) {
		switch (level) {
			case 'items': 
				return copyData(data);
			case 'days': 
				return calculateSummaries(data,
					function(date) { 
					 	return Utils.str2year(date) + "-" + Utils.str2month(date) + "-" + Utils.str2day(date);
					});
			case 'months': 
				return calculateSummaries(data,
					function(date) { 
					 	return Utils.str2year(date) + "-" + Utils.str2month(date);
					});
			case 'years': 
				return calculateSummaries(data,
					function(date) { 
					 	return Utils.str2year(date);
					});
			default: console.log('Err: unknown level: ' + level);
		}	
	};

	var copyData = function(data) {
		return _.map(data, function(line) {
			return {
				date:		line.date, 
				odo:		line.odo,
				prevOdo:	line.prevOdo,
				dist:		line.dist,
				fuel:		line.fuel,
				milage:		line.milage,
				type:		line.type,
				info:		line.info
			};
		});
	};

	var calculateSummaries = function(data, keyFunction) {
		var groupedData = _.foldl(data, function(prev, line) {		
			var key = keyFunction(line.date);
			if (!prev[key]) {
				prev[key] = { 'data': [] };
			}
			prev[key].data.push(line);
			return prev;
		}, { });
		return createLines(groupedData);
	};

	var createLines = function(groupedData) {
		var results = [];
		_.each(groupedData, function(lines) {
			results.push(_.foldl(lines.data, function(memo, line) {
				memo.date = _.max([memo.date, Utils.str2date(line.date)]);
				memo.odo = _.max([memo.odo, parseInt(line.odo)]);
				memo.prevOdo = _.min([memo.odo, memo.prevOdo, parseInt(line.prevOdo)]);
				memo.dist = Utils.nullSafeSum(memo.dist, parseInt(line.dist));
				memo.fuel = Utils.nullSafeSum(memo.fuel, parseFloat(line.fuel));
				memo.milage = Utils.milage(memo.fuel, memo.dist);
				memo.detailedInfo = memo.detailedInfo + line.info + '\n';
				return memo;
			}, {
				'date': '1970-01-01',
				'info': _.size(lines.data) + ' tankkausta',
				'detailedInfo': "",
				'type': 'its complicated',
				'showDetailedInfo': false 
			}));
		});
		return results;
	};

	var sortBy = function(orderBy, list) {
		var sorted = _.sortBy(list, orderBy.field);
		return orderBy.descending ? sorted.reverse() : sorted;
	};

	var bySelectedDay = function(selectedDay) {
		return function(item) {
			if (selectedDay) {
				return (parseInt(Utils.str2day(Utils.toDateString(item.date)))==selectedDay);
			} else {
				return true;
			}
		};
	};

	var bySelectedMonth = function(selectedMonth) {
		return function(item) {
			if (selectedMonth) {
				return (parseInt(Utils.str2month(Utils.toDateString(item.date)))==selectedMonth);
			} else {
				return true;
			}
		};
	};

	var bySelectedYear = function(selectedYear) {
		return function(item) {
			if (selectedYear) {
				return (parseInt(Utils.str2year(Utils.toDateString(item.date)))==selectedYear);
			} else {
				return true;
			}
		};
	};

	var calculateLines = function(data, level, selectedDate, orderBy) {
		return sortBy(orderBy, 
			summarizeData(level,
				_.chain(data)
				.filter(bySelectedDay(selectedDate.day))
				.filter(bySelectedMonth(selectedDate.month))
				.filter(bySelectedYear(selectedDate.year))
				.value()
			)
		);
	};

	return {
		calculateLines: function(data, level, selectedDate, orderBy) {
			return {
				Tankkaukset: calculateLines(data.fuel, level, selectedDate, orderBy),
				Renkaat: calculateLines(data.tyres, level, selectedDate, orderBy),
				Huollot: calculateLines(data.maintenance, level, selectedDate, orderBy),
				Kaudet: data.seasons,
				Muut: calculateLines(data.other, level, selectedDate, orderBy)
			};
		}
	};

})

.factory('DataTable', function(DataTableSummaryUtils, Utils) {

	'use strict';

	var _data, _summaryLevel, _dateSelection, _orderBy, _lines, _maxOdo;

	var updateLines = function() {
		_lines = DataTableSummaryUtils.calculateLines(_data, _summaryLevel, _dateSelection, _orderBy);
		_maxOdo = _.chain([_data.fuel, _data.tyres, _data.maintenance, _data.other]).flatten(true).pluck('odo').max().value();
	};

	var setSummmaryLevel = function(level) {
		_summaryLevel = level;
		updateLines();
	};

	var isSummmaryLevel = function(level) {
		return _summaryLevel == level;
	};

	var toggleValue = function(currentValue, potentialNewValue) {
		return currentValue && (currentValue == potentialNewValue) ? null : potentialNewValue;
	};

	var toggleSelected = function(level, newValue) {
		_dateSelection[level] = toggleValue(_dateSelection[level], newValue);
		updateLines();
	};

	var hasSelected = function(level) {
		if(!level) {
			return hasSelected('day') || 
			       hasSelected('month') || 
			       hasSelected('year');
		} else {
			return _dateSelection[level] ? true : false;
		}
	};
	

	var getSelected = function(level) {
		return _dateSelection[level];
	};

	var isOrderedBy = function(field) {
		return _orderBy.field == field;
	};

	var orderBy = function(field) {
		if (!isOrderedBy(field)) {
			_orderBy.field = field;
			_orderBy.descending = defaultOrderForField(field);
		} else {
			_orderBy.descending = !_orderBy.descending;
		}
		updateLines();
	};

	var defaultOrderForField = function(field)  {
		switch (field) {
			case 'milage': 
				return false;
			default:
				return true;
		}
	};

	var setDefaultValues = function() {
		_summaryLevel = 'items';
		_orderBy = {
			field: 'odo',
			descending: true
		};
		_dateSelection =  {
			day: null, 
			month: null,
			year: parseInt(Utils.str2year(Utils.date2str(new Date())))
		};		
	};

	var resetSettings = function() {
		setDefaultValues();
		updateLines();
	};

	var setData = function(newData) {
		_data = newData;
		updateLines();
	};

	setDefaultValues();

	return {
		lines: function() { return _lines; },
		setRawData: setData,
		getRawData: function() { return _data; },
		updateLines: updateLines,
		setSummmaryLevel: setSummmaryLevel, 
		isSummmaryLevel: isSummmaryLevel,
		toggleSelected: toggleSelected,
		getSelected: getSelected,
		hasSelected: hasSelected,
		isOrderedBy: isOrderedBy,
		orderBy: orderBy,
		resetSettings: resetSettings,
		maxOdo: function() { return _maxOdo; },
	};

});
