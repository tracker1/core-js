//stub out firebug console object
//		will allow console statements to be left in place
if (typeof Function.empty != 'function') Function.empty = function(){};
if (typeof console == 'undefined') console = {};
if (typeof console.log == 'undefined') console.log = Function.empty;
if (typeof console.debug == 'undefined') console.debug = console.log;
if (typeof console.info == 'undefined') console.info = console.log;
if (typeof console.warn == 'undefined') console.warn = console.log;
if (typeof console.error == 'undefined') console.error = console.log;
if (typeof console.assert == 'undefined') console.assert = Function.empty;
if (typeof console.dir == 'undefined') console.dir = function(input) { 
	if (typeof JSON != 'undefined')
		console.log( JSON.stringify(input) );
	else
		console.log(input.toString());
};
if (typeof console.dirxml == 'undefined') console.dirxml = Function.empty;
if (typeof console.trace == 'undefined') console.trace = Function.empty;
if (typeof console.group == 'undefined') console.group = Function.empty;
if (typeof console.groupCollapsed == 'undefined') console.groupCollapsed = Function.empty;
if (typeof console.groupEnd == 'undefined') console.groupEnd = Function.empty;
if (typeof console.time == 'undefined') console.time = Function.empty;
if (typeof console.timeEnd == 'undefined') console.timeEnd = Function.empty;
if (typeof console.profile == 'undefined') console.profile = Function.empty;
if (typeof console.profileEnd == 'undefined') console.profileEnd = Function.empty;
if (typeof console.count == 'undefined') console.count = Function.empty;
