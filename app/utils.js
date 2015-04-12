

mcEventLog.factory('Utils', function() {

	'use strict';

	var toDateString = function(date) {
		if (date.getMonth) {
			// Oletetaan että on Date-olio
			return date2str(date);
		} else {
			// Oletetaan että on asiallisesti muotoitu stringi
			return date;
		}
	};

	var toDate = function(date) {
		if (date.getMonth) {
			// Oletetaan että on Date-olio
			return date;
		} else {
			// Oletetaan että on asiallisesti muotoitu stringi
			return str2date(date);
		}
	};

	var str2date = function(str) {
		if (str) {
			var values = str.split('-');
			return new Date(values[0],values[1]-1,values[2]);
		} else {
			return new Date(1970,1,1);
		}
	};

	var date2str = function(date) {
		var day = date.getDate() < 10 ? "0" + date.getDate() : "" + date.getDate();
		var month = date.getMonth() < 9 ? "0" + (date.getMonth()+1) : "" + (date.getMonth()+1);
		return date.getFullYear() + "-" + month + "-" + day;
	};

	var str2year = function(str) {
		var values = str.split('-');
		return values[0];
	};

	var str2month = function(str) {
		var values = str.split('-');
		return values[1];
	};

	var str2day = function(str) {
		var values = str.split('-');
		return values[2];
	};

	var nullSafeSum = function(a, b) {
		if (!b) b=0;
		if (a) return a + b;
		else return b;
	};

	var milage = function(fuel, dist) {
		return 100.0 * fuel / dist;
	};

	return {
		str2date: str2date,
		date2str: date2str,
		toDateString: toDateString,
		toDate: toDate,
		str2year: str2year, 
		str2month: str2month,
		str2day: str2day, 
		nullSafeSum: nullSafeSum,
		milage: milage
	};

});