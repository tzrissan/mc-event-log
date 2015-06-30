/*jshint multistr: true */
var dataCellTemplates = (function() {
  return {
    summerizeByCell: function(scope, title) {
      return '<th><div ng-class="isSummarizedBy(\'' + scope + '\')?\'selected\':\'\'"  ng-click="summarize(\'' + scope + '\')" >' + title + '</div></th>';
    },
    selectedCell: function(scope) {
      return '<td> \
  <span ng-show="canSelectPrev(\'' + scope + '\')" ng-click="selectPrev(\'' + scope + '\')">&larr;</span> \
  <span ng-show="hasSelected(\'' + scope + '\')" ng-click="unSelect(\'' + scope + '\')">{{getSelected(\'' + scope + '\')}}</span> \
  <span ng-show="canSelectNext(\'' + scope + '\')" ng-click="selectNext(\'' + scope + '\')">&rarr;</span> \
</td>';
    },
    selectCell: function(scope, flag, format) {
return '<td> \
  <span ng-show="canSelectPrev(\'' + scope + '\')" ng-click="selectPrev(\'' + scope + '\')">&larr;</span> \
  <span ng-show="'+ flag +'" ng-class="hasSelected(\'' + scope + '\')?\'selected\':\'\'" ng-click="select(\'' + scope + '\', line.date)">{{line.date | date: \'' + format + '\' }}</span> \
  <span ng-show="canSelectNext(\'' + scope + '\')" ng-click="selectNext(\'' + scope + '\')">&rarr;</span> \
</td>';
    }
  };
})();


var mcEventLog = angular.module('mcEventLog');

//-----------------------------------

mcEventLog.directive('selectDayCell', function() {
	return {
		template: dataCellTemplates.selectCell('day', 'showDate', 'dd')
	};
});

mcEventLog.directive('selectMonthCell', function() {
  return {
    template: dataCellTemplates.selectCell('month', 'showMonth', 'MM')
  };
});

mcEventLog.directive('selectYearCell', function() {
  return {
    template: dataCellTemplates.selectCell('year', 'showYear', 'yyyy')
  };
});

//-----------------------------------

mcEventLog.directive('selectedDayCell', function() {
  return {
    template: dataCellTemplates.selectedCell('day')
  };
});

mcEventLog.directive('selectedMonthCell', function() {
  return {
    template: dataCellTemplates.selectedCell('month')
  };
});

mcEventLog.directive('selectedYearCell', function() {
  return {
    template: dataCellTemplates.selectedCell('year')
  };
});

//-----------------------------------

mcEventLog.directive('summerizeByDayCell', function() {
  return {
    template: dataCellTemplates.summerizeByCell('days', 'pv')
  };
});

mcEventLog.directive('summerizeByMonthCell', function() {
  return {
    template: dataCellTemplates.summerizeByCell('months', 'kk')
  };
});

mcEventLog.directive('summerizeByYearCell', function() {
  return {
    template: dataCellTemplates.summerizeByCell('years', 'vuosi')
  };
});

//-----------------------------------
