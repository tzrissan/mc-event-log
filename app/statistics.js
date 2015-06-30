

mcEventLog.factory('StatisticsUtil', function(Utils) {

	'use strict';

	var pluckNumbers = function(lines, field) {
		return _.chain(lines)
				.pluck(field)
				.filter(function(val) { 
					return _.isNumber(val) && val > 0;
				}).value();
	};

	var pluckDates = function(lines, field) {
		return _.chain(lines)
				.pluck(field)
				.map(Utils.str2date)
				.filter(function(val) { return val; })
				.value();
	};

	var fuelStatLine = function(info, func, lines) {
		return {
			info: info,
			date: func(pluckDates(lines, 'date')),
			odo: func(pluckNumbers(lines, 'odo')),
			dist: func(pluckNumbers(lines, 'dist')),
			fuel: func(pluckNumbers(lines, 'fuel')),
			milage: func(pluckNumbers(lines, 'milage'))
		};
	};

	var sum = function(list) {
		return _.reduce(list, function(memo, fuel) { return memo + fuel; }, 0.0);
	};

	var avg = function(list) {
		return sum(list) / list.length;
	};

	var fuelStatLineAvg = function(info, lines) {
		var dists = pluckNumbers(lines, 'dist');
		var fuels = pluckNumbers(lines, 'fuel');

		return {
			info: info,
			dist: avg(dists),
			fuel: avg(fuels),
			milage: Utils.milage(sum(fuels), sum(dists))
		};
	};

	var fuelStatLineTotal = function(info, lines) {
		var dists = pluckNumbers(lines, 'dist');
		var fuels = pluckNumbers(lines, 'fuel');

		return {
			info: info,
			dist: sum(dists),
			fuel: sum(fuels)
		};
	};

	var findMaxByType = function(lines, type, field) {
		return _.chain(lines)
						.filter(function(line) { return line.type===type; })
						.pluck(field)
						.union(0)
						.max()
						.value();
	};

	var flattenRawData = function(rawData) {
		return _.union(rawData.fuel, rawData.maintenance, rawData.tyres, rawData.other);
	};

	var findSeasonDates = function(d, field) {
		return _.map(d, function(i) { 
							var date = new Date(i[field]);
							date.setFullYear(2000);
							return date;
						});
	};

	var findMaxDate = function(d, field) {
		return _.max(findSeasonDates(d, field));
	};

	var findMinDate = function(d, field) {
		return _.min(findSeasonDates(d, field));
	};

	var findAvgDate = function(d, field) {
		return _.average(findSeasonDates(d, field));
	};

	var seasonStatLine = function(info, start, end) {
		return {
				info: info,
				start: start,
				end: end
		};
	};

	return {
		countFuelStats: function(lines) {
			return [
				fuelStatLine("max", _.max, lines),
				fuelStatLineAvg("avg", lines),
				fuelStatLine("min", _.min, lines),
				fuelStatLineTotal("total", lines)
			];
		}, 
		countTyreStats: function(rawData, maxOdo) {
			return [{
				date: new Date(),
				odo: maxOdo,
				front: (maxOdo-findMaxByType(rawData, 'TYRE_FRONT', 'odo')),
				rear: (maxOdo-findMaxByType(rawData, 'TYRE_REAR', 'odo')),
				info: 'Alla olevien renkaiden ikä'
			}];
		},
		countMaintenanceStats: function(rawData, maxOdo) {
			return [{
				date: new Date(),
				odo: maxOdo,
				dist: (maxOdo-findMaxByType(rawData, 'MAINTENANCE', 'odo')),
				info: 'Aikaa edellisesti huollosta'
			}];
		},
		countSeasonStats: function(rawData) {
			return [
				seasonStatLine('max', findMaxDate(rawData, 'start'), findMaxDate(rawData, 'end')),
				seasonStatLine('min', findMinDate(rawData, 'start'), findMinDate(rawData, 'end'))
			];
		}

	};
});