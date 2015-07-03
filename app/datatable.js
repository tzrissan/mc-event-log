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
				date:        line.date, 
				odo:         line.odo,
				bike:        line.bike,
				prevOdo:     line.prevOdo,
				dist:        line.dist,
				fuelfilled:  line.fuelfilled,
				fuelused:    line.fuelused,
				milage:      line.milage,
				type:        line.type,
				info:        line.info
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
			var bikes = _.chain(lines.data)
			             .pluck('bike')
			             .uniq()
			             .foldl(function(a,b) { return a + ', ' + b; })
			             .value();
			results.push(_.foldl(lines.data, function(memo, line) {
				memo.date = _.max([memo.date, Utils.str2date(line.date)]);
				memo.odo = _.max([memo.odo, parseInt(line.odo)]);
				memo.prevOdo = _.min([memo.odo, memo.prevOdo, parseInt(line.prevOdo)]);
				memo.bike = bikes;
				memo.dist = Utils.nullSafeSum(memo.dist, parseInt(line.dist));
				memo.fuelfilled = Utils.nullSafeSum(memo.fuelfilled, parseFloat(line.fuelfilled));
				memo.fuelused = Utils.nullSafeSum(memo.fuelused, parseFloat(line.fuelused));
				memo.milage = Utils.milage(memo.fuelused, memo.dist);
				memo.detailedInfo = memo.detailedInfo + line.info + '\n';
				return memo;
			}, {
				'date': '1970-01-01',
				'info': _.size(lines.data) + ' riviä',
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

	var filterByBike = function(d, b) {
		return _.filter(d, function(line) { return line.bike===b; } );
	};

	var filterByType = function(d, t1, t2) {
		return _.filter(d, function(line) { return line.type===t1 || ( t2 && line.type===t2 ); } );
	};

	return {
		calculateLines: function(data, level, selectedDate, orderBy) {
			return {
				Tankkaukset: calculateLines(filterByType(data, 'FUEL'), level, selectedDate, orderBy),
				Renkaat: calculateLines(filterByType(data, 'TYRE_FRONT', 'TYRE_REAR'), level, selectedDate, orderBy),
				Huollot: calculateLines(filterByType(data, 'MAINTENANCE'), level, selectedDate, orderBy),
				Kaudet: data.seasons,
				Muut: calculateLines(filterByType(data, 'OTHER'), level, selectedDate, orderBy)
			};
		}
	};

})

.factory('DataTable', function(DataTableSummaryUtils, Utils) {

	'use strict';

	var _data, _summaryLevel, _dateSelection, _orderBy, _lines, _maxOdo;

	var updateLines = function() {
		_lines = DataTableSummaryUtils.calculateLines(_data, _summaryLevel, _dateSelection, _orderBy);
		_maxOdo = _.chain([_data.fuelfilled, _data.fuelused, _data.tyres, _data.maintenance, _data.other]).flatten(true).pluck('odo').max().value();
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

	var defaultOrderForField = function(field)  {
		switch (field) {
			case 'milage': 
				return false;
			default:
				return true;
		}
	};

	var orderBy = function(field) {
		if (!isOrderedBy(field)) {
			_orderBy.field = field;
			_orderBy.descending = defaultOrderForField(field);
		} else {
			if (_orderBy.descending === defaultOrderForField(field)) {
				_orderBy.descending = !_orderBy.descending;
			} else {
				_orderBy = {
					field: 'date',
					descending: true
				}
			}
		}
		updateLines();
	};

	var setDefaultValues = function() {
		_summaryLevel = 'items';
		_orderBy = {
			field: 'date',
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
