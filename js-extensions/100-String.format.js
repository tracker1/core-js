//console.debug("begin string.toformat.js");
/***** Begin String.format - MIT License ************************************

Copyright (c) 2009 - Michael J. Ryan (http://tracker1.info)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

===============================================================================
Thanks for the inspiration - http://blairmitchelmore.com/javascript/string.format

//inline arguments
String.format(
    "some string with {0} and {1} injected using argument {{number}}", 
	'first value', 
	'second value'
);
returns: 'some string with first value and second value injected argument {number}'

//single array
String.format(
	"some string with {0} and {1} injected using array {{number}}", 
	[ 'first value', 'second value' ]
);
returns: 'some string with first value and second value injected using array {number}'

//single object
String.format(
	"some string with {first} and {second} value injected using {{propertyName}}",
	{
		first:'first value',
		second:'second value'
	}
);
returns: 'some string with first value and second value injected using {propertyName}'

******************************************************************************/
(function() {

	//returns true for null, undefined and empty string
	function isEmpty(obj) {
		if (typeof obj == 'undefined' || obj === null || obj === '') return true;
		if (typeof obj == 'number' && isNaN(obj)) return true;
		if (obj instanceof Date && isNaN(Number(obj))) return true;
		return false;
	}

	//gets the format method to use for the object instance
	//		don't expose this method, it isn't safe for use outside this script
	function getFormatter(obj) {
		//it's a string, undefined or null, use default toString method
		if (typeof obj == "string" || typeof obj == "undefined" || obj === null) {
			return String.prototype.toString;
		}
		
		//it has a format method
		if (typeof obj.format == "function") {
			return obj.format;
		}
		
		//determin the constructor base & prototype to use
		var ctor = function(o) {
			if (typeof o == 'number') return Number;
			if (typeof o == 'boolean') return Boolean;
			return o.constructor;
		}(obj);
		var proto = ctor.prototype;

		//prototype has a format method use it (why was it overriden/deleted from the instance?)
		if (proto && typeof proto.format == 'function') return ctor.prototype.format;
		
		//object has a toString method use it
		if (typeof obj.toString == 'function') return obj.toString;

		//prototype has a toString method use it
		if (proto && typeof proto.toString == 'function') return proto.toString;

		//use the string's toString method - final resort
		return String.prototype.toString;
	}
	

	//convert an object to a string with an optional format to use
	function stringFromAny(obj, format) {
		//the object is nothing, use an empty string
		if (isEmpty(obj))
			return "";
			
		//get the formatter to use for the object
		var formatter = getFormatter(obj);

		//a formatter was found, use it
		if (formatter) {
			if (isEmpty(format)) {
				try {
					return formatter.call(obj);
				} catch(err) {
					//errors with Microsoft Ajax Toolkit
					try {
						return formatter.call(obj,"");	
					} catch(err1) {
						if (typeof console != "undefined") (console.error || console.log)(err1);
						return ""; //unable to format
					}
				}
			} else {
				return formatter.call(obj,format);
			}
		}
		else
			return ""; //no formatter, use empty string, this should *NEVER* happen.
	}
	
	
	//basic format, used when a single, or no arguments are passed in
	function basicFormat(source) {
		//null argument, return empty string
		if (isEmpty(source))
			return "";
		
		//it's a string, return it as-is
		if (typeof source == "string")
			return String(source);
		
		//it has a formatter, use that
		if (source && source.format)
			return source.format();
		
		//it's an array, use it as one - recursive call
		if (source && source.length) 
			return String.format.apply(source[0], Array.prototype.slice.call(arguments, 0, 1));
		
		//force it to a string
		return String(source);
	}
    
	//normalize arguments into parameter array
	function setParams() {
		var undef; //undefined value

		//remove first item from stack
		var params = Array.prototype.slice.call(arguments, 1);
		
		//only one param
		if (params.length == 1) {
			//set the params to the instance of the one param
			params = params[0];

			//use an empty string for null and undefined valuse
			if (params === null || params === undef) return [''];
			
			//reference to the type of params
			var t = typeof params;
			
			//if it (has format or not an object) and not an array)
			if ((params.format || t != 'object') && t != 'array' )
				params = [ params ]; //put the param inside an array
		}
		
		//return normalized input parameters
		return params;
	}
	
	function stringformat(source, params) {
		//only one argument, force it to a proper string.
		if ( arguments.length < 2 ) {
			basicFormat(source);
		}
			
		//normalize the input parameters
		params = setParams.apply(null, arguments);
		var outerLength = arguments.length;
			
		//run a replace method against the source string, matching against
		//	named/numbered parameters
		//
		//	will match on escaped braces {{ or }}
		//		or an embedded code {code} with optional format {code:format}
		var ret = source.replace(
			/\{\{|\}\}|\{([^}: ]+?)(?::([^}]*?))?\}/g, 
			function(match, num, format) {
				if (match == "{{") return "{"; //unescape the nested {
				if (match == "}}") return "}"; //unescape the nested }
				if (typeof params[num] == "undefined") {
					//if there was only one parameter, and the match is "0", and there's no "0" in params, use the params as the binding formatter
					//should fix "... {0:...}".toFormat(singleItem)
					if (num === "0" && outerLength == 2) return stringFromAny(params, format);

					return match; //no param value available
				}

				return stringFromAny(params[num], format); //convert the input replacement to a proper string
			}
		);
		return ret;
	}

	//main string formatter
	if (typeof String.format != "function") {
		String.format = stringformat;
	}
	if (typeof String.asFormat != "function") {
		String.asFormat = stringformat;
	}


	//create a format method for string instances
	if (typeof String.prototype.format != "function") {
		String.prototype.format = function() {
			var args = Array.prototype.slice.call(arguments);
			args.unshift(this);
			return stringformat.apply(null, args);
		};
	}
	if (typeof String.prototype.asFormat != "function") {
		String.prototype.asFormat = function() {
			var args = Array.prototype.slice.call(arguments);
			args.unshift(this);
			return stringformat.apply(null, args);
		};
	}
	
})();

//console.debug("begin string.toformat.js");