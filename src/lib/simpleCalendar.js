/*global angular, require */

var Calendar = require('calendar-base').Calendar;

/* @ngInject */
function simpleCalendarDirective($compile) {
  var template = require('html!./calendar.tmpl.html');
  return {
    restrict: 'EA',
    scope: {
      'date': '=',
      'events': '='
    },
    controller: simpleCalendarCtrl,
    controllerAs: 'calendar',
    bindToController: true,
    transclude: true,
    link: function postLink(scope, iElement, iAttrs, ctrl, transcludeFn) {
      transcludeFn(scope, function(clone){
        var root = angular.element('<div />').append(template);
        var day = root.querySelectorAll('.simple-calendar-day');
        var transcluded = angular.element('<div />');
        day.append(clone);

        var dayTemplate = day.querySelectorAll('simple-calendar-day');
        if (dayTemplate.length === 0){
          transcluded.append('{{$day.day}}');
        } else {
          transcluded.append(dayTemplate.html());
        }

        var events = root.querySelectorAll('simple-calendar-event');
        if (events.length){
          var eventTemplate = angular.element('<div class="simple-calendar-event" />');
          eventTemplate.attr('ng-repeat', '$event in $day.events');
          eventTemplate.html(events.html());
          transcluded.append(eventTemplate);
        }

        day.empty().append(transcluded);

        var compiled = $compile(root.children())(scope);
        iElement.append(compiled);
      });
      ctrl.init(iElement);
    }
  };
}

/* @ngInject */
function simpleCalendarCtrl($scope, $element, $attrs, simpleCalendarConfig) {
  var vm = this;
  var cal_opts = angular.extend(simpleCalendarConfig, {siblingMonths: true});
  var cal = new Calendar(cal_opts);
  var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var start = days.splice(simpleCalendarConfig.weekStart);

  vm.weekdays = start.concat(days);
  vm.init = init;

  function init() {
    vm.date = vm.date || new Date();
    vm.events = getEvents().slice();

    $scope.$watchCollection(getEvents, function() {
      updateCalendar(vm.date);
    });

    $scope.$watch(getDate, function() {
      updateCalendar(vm.date);
    });
  }

  function getDate() {
    return vm.date;
  }

  function getEvents() {
    return vm.events || [];
  }

  function updateCalendar(date) {
    var args = getDateArgs(new Date(date));
    vm.days = cal.getCalendar.apply(cal, args);
    vm.days.forEach(mapEvents.bind(null, vm.events));
    vm.weeks = segment(vm.days, 7);
  }

  function mapEvents(events, day) {
    var dayEvents = events.filter(function(e) {
      var date = new Date(e.date);
      var args = getDateArgs(date);
      var match = (args[0] === day.year &&
        args[1] === day.month &&
        args[2] === day.day);
      return match;
    });
    day.events = dayEvents;
  }

  function getDateArgs(date) {
    return [date.getFullYear(), date.getMonth(), date.getDate()];
  }

  function segment(collection, groupSize) {

    var copy = collection.slice();
    var numGroups = (copy.length / groupSize);
    var groups = [];

    for (var i = 0; i < numGroups; i++) {
      groups.push(copy.splice(0, groupSize));
    }

    return groups;
  }
}

module.exports = simpleCalendarDirective;
