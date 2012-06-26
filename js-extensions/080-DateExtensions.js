/***** Begin ECMAScript 5 ISO Support - MIT License ***************************

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

This script implements the support for ISO-Style date parsing in a new Date() 
as well as support for Date.prototype.toISOString().

There is also an additional Date.fromISOString definition for use as needed.

******************************************************************************/
//console.debug("begin dateextensions.js");
(function(){

    //create handle to the original date object class
	var OriginalDate = Date;

	//parsing of ISO dates ex: new Date('1970-01-01T00:00:00.000Z');
	if (isNaN(new Date("1970-01-01T00:00:00.000Z"))) {
		//wrap the Date implementation around the original to support a new Date from an ISO-8601 style string
		Date = function() {
			switch(arguments.length) {
				case 0: return new OriginalDate();
				case 1:
					//handle iso date input, or delegate to original
					return Date.fromISOString(arguments[0]) || new OriginalDate(arguments[0]);
				case 2: return new OriginalDate(arguments[0], arguments[1]);
				case 3: return new OriginalDate(arguments[0], arguments[1], arguments[2]);
				case 4: return new OriginalDate(arguments[0], arguments[1], arguments[2], arguments[3]);
				case 5: return new OriginalDate(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
				case 6: return new OriginalDate(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
				case 7: return new OriginalDate(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6]);
				case 8: return new OriginalDate(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7]);
				case 9: return new OriginalDate(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7], arguments[8]);
				default: //max of 10 arguments supported
					return new OriginalDate(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7], arguments[8], arguments[9]);
			}
		};
		
		//Clone methods on OriginalDate
		for (var x in OriginalDate)
			if (typeof OriginalDate[x] == 'function' && typeof Date[x] == 'undefined')
				Date[x] = OriginalDate[x];
				
		//Mark prototype for inheritance
		OriginalDate.prototype.constructor = Date;
		Date.prototype = OriginalDate.prototype;
	}

	//Implement ECMAScript 5's Date.prototype.toISOString
	if (typeof Date.prototype.toISOString != 'function') {
		//Add a toISOString method.
		Date.prototype.toISOString = function() {

			var y = zpad(4, this.getUTCFullYear());
			var m = zpad(2, this.getUTCMonth() + 1);
			var d = zpad(2, this.getUTCDate());
			var h = zpad(2, this.getUTCHours());
			var n = zpad(2, this.getUTCMinutes());
			var s = zpad(2, this.getUTCSeconds());
			var ms = zpad(3, this.getUTCMilliseconds());
			return y + '-' + m + '-' + d + 'T' + h + ':' + n + ':' + s + '.' + ms + 'Z';
		};
	}
	
	//Method to create a localized ISO-8601 string with local offset
	if (typeof Date.prototype.toLocalISOString != 'function') {
		Date.prototype.toLocalISOString = function() {
			var y = zpad(4, this.getFullYear());
			var m = zpad(2, this.getMonth() + 1);
			var d = zpad(2, this.getDate());
			var h = zpad(2, this.getHours());
			var n = zpad(2, this.getMinutes());
			var s = zpad(2, this.getSeconds());
			var ms = zpad(3, this.getMilliseconds());
			
			var ret = y + '-' + m + '-' + d + 'T' + h + ':' + n + ':' + s + '.' + ms;
			
			var offset = new Date(0) - new Date(1970,0,1);
			if (offset == 0) return ret + 'Z';

			ret += (offset < 0 ? '-' : '+');
			
			if (offset < 0) offset = -offset;
			var offsetmin = Math.floor(offset / (1000 * 60));
			var offsethrs = Math.floor(offsetmin / 60);
			offsetmin = offsetmin % 60;
			ret += zpad(2,offsethrs) + ':' + zpad(2,offsetmin);
			
			return ret;
		};
	}
	
	if (typeof Date.fromISOString != 'function') {
		//method to handle conversion from an ISO-8601 style string to a Date object
		//	Date.fromISOString("2009-07-03T16:09:45Z")
		//		Fri Jul 03 2009 09:09:45 GMT-0700
		Date.fromISOString = function(input) {
			//early shorting of invalid input
			if (typeof input !== "string" || input.length < 10 || input.length > 40) return null;
		
			var iso8601Format = /^(\d{4})-(\d{2})-(\d{2})((([T ](\d{2}):(\d{2})(:(\d{2})(\.(\d{1,12}))?)?)?)?)?([Zz]|([\-+])(\d{2}):(\d{2}))?$/;
		
			//normalize input
			input = input.toString().replace(/^\s+/,'').replace(/\s+$/,'');
		
			if (!iso8601Format.test(input))
				return null; //invalid format

			var d = input.match(iso8601Format);
			var offset = 0;
			
			var date = new Date(+d[1], +d[2]-1, +d[3], +d[7] || 0, +d[8] || 0, +d[10] || 0, Math.round(+("0." + (d[12] || 0)) * 1000));
		
			//use specified offset
			if (d[13] == 'Z') offset = 0-date.getTimezoneOffset();
			else if (d[13]) offset = ((+d[15] * 60) + (+d[16]) * ((d[14] == '-') ? 1 : -1)) - date.getTimezoneOffset();

			date.setTime(date.getTime() + (offset * 60000));
		
			if (date.getTime() <= new Date(-62135571600000).getTime()) // CLR DateTime.MinValue
				return null;
		
			return date;
		};
	}
	
	if (typeof Date.UTC != 'function') {
		Date.UTC = function(year, month, date, hours, minutes, seconds, ms) {
			//normalize input
			year = isNaN(year) ? 1970 : Number(year);
			month = isNaN(month) ? 0 : Number(month);
			date = isNaN(date) ? 1 : Math.floor(Number(date));
			hours = isNaN(hours) ? 0 : Number(hours);
			minutes = isNaN(minutes) ? 0 : Number(minutes);
			seconds = isNaN(seconds) ? 0 : Number(seconds);
			ms = isNaN(ms) ? 0 : Number(ms);
			if (Math.round(year) >= 0 && Math.round(year) <= 99) year = 1900 + Math.round(year);
			
			//set the result/return object
			var ret = new Date();
			ret.setUTCFullYear(year, month, date);
			ret.setUTCHours(Number(hours), Number(minutes), Number(seconds), Number(ms));
			return ret.getTime(); //returns a number
		};
	}
	
	if (typeof Date.now != 'function') {
		Date.now = function() {
			return new Date().getTime();
		};
	}
	
	
	//method to zero-pad a string
	function zpad(len, input) {
		var ret = String(input);
		while (ret.length < len)
			ret = '0' + ret;
		return ret;
	}

})();
/***** End of ECMAScript v5 ISO support **************************************/



/***** Extensions to the Date object *****/

//Extend static values on the Date class
Date.constants = {
	clrMin:new Date(-62135571600000)
	,clrMax:new Date(253402300799999)
	,sqlMin:new Date("1900-01-01Z")
	,msAjaxFormatEarly:/\"\\\/Date\((\-?\d+)\)\\\/\"/g
	,msAjaxFormat:/^\/Date\((\-?\d+)\)\/$/
	,second: 1000
	,minute: 1000 * 60
	,hour: 1000 * 60 * 60
	,day: 1000 * 60 * 60 * 24
	,practicalMinYear: 1900
	,practicalMaxYear: (new Date()).getFullYear() + 10
};

Date.now = function(){
	return new Date();
};

Date.practicalParse = function(val) {
	try {
		//normalize the input, replace \ with /, and add spaces for 12MAR2010 style date inputs
		val = (val || '').trim().replace(/\\/g, '/').replace(/^([0-9]*)\s*([a-z]*)\s*([0-9]*)$/i, '$1 $2 $3').trim().replace(/\s+/g,' ');

		//no value/input
		if (!val) return null;

		//only digits, and less than 8 digits, don't attempt to parse
		if ((/^\d{1,7}$/).test(val)) return null;

		//if only a two-part date, don't attempt to parse
		if ((/^\d*\D\d*$/).test(val)) return null;

		var dtm = Date.parse(val); //parse the value into a Date

		//is the parsed value a Date, and within the practical range of dates.
		return (dtm instanceof Date) ? dtm : null; // (dtm instanceof Date && dtm.getFullYear() >= Date.constants.practicalMinYear && dtm.getFullYear() <= Date.constants.practicalMaxYear) ? dtm : null;

	} catch(err) {

		//parsing error
		return null;

	}
};

/*** Begin UTC/Local conversion support ***************************************
Methods for converting to/from UTC and identifying additional attributes 
for date/time logic.
******************************************************************************/
	Date.kind = { "unspecified":"Unspecified", "utc":"Utc", "local":"Local" };

	Date.prototype.kind = Date.kind.unspecified;

	Date.specifyKind = function(date, kind) {
		//not a date, return the original value
		if (!(date && date instanceof Date)) return date;
		
		//update the date object to match the kind
		var k = kind.toString().toLowerCase().replace(/^\s+|\s+$/g,'');
		if (Date.kind[k] == Date.kind.utc) {
			date.kind = Date.kind.utc;
			return date.toUTC();
		}
		else if (Date.kind[k] == Date.kind.local) {
			date.kind = Date.kind.local;
			return date.toLocal();
		}
		else date.kind = Date.kind.unspecified;
		
		return date;
	};

	Date.prototype.specifyKind = function(kind) {
		return Date.specifyKind(this, kind);
	};

	//convert from utc time to local time
	Date.prototype.toLocal = function() {
		//if the date is UTC adjust from the utc offset
		if (this.kind == Date.kind.utc) {
			var dv = this.getDate();
			var offset = new Date().getTimezoneOffset() * 60 * 1000;
			this.setTime(dv - offset);
			this.kind = Date.kind.utc;
		}
		
		//override instance prototypes
		this.getDate = Date.prototype.getDate;
		this.getDay = Date.prototype.getDay;
		this.getFullYear = Date.prototype.getFullYear;
		this.getHours = Date.prototype.getHours;
		this.getMilliseconds = Date.prototype.getMilliseconds;
		this.getMinutes = Date.prototype.getMinutes;
		this.getMonth = Date.prototype.getMonth;
		this.getSeconds = Date.prototype.getSeconds;
		this.getTimezoneOffset = Date.prototype.getTimezoneOffset;
		this.getYear = Date.prototype.getYear;

		this.setDate = Date.prototype.setDate;
		this.setFullYear = Date.prototype.setFullYear;
		this.setHours = Date.prototype.setHours;
		this.setMilliseconds = Date.prototype.setMilliseconds;
		this.setMinutes = Date.prototype.setMinutes;
		this.setMonth = Date.prototype.setMonth;
		this.setSeconds = Date.prototype.setSeconds;
		this.setTimeout = Date.prototype.setTimeout;
		this.setYear = Date.prototype.setYear;

		this.toString = Date.prototype.toString;
		return this;
	};

	//convert a local time to utc
	Date.prototype.toUTC = function() {
		//if the date isn't already UTC adjust based on the offset
		if (this.kind != Date.kind.utc) {
			var dv = this.getTime();
			var offset = new Date().getTimezoneOffset() * 60 * 1000;
			this.setTime(dv + offset);
			this.kind = Date.kind.utc;
		}
		
		//override instance prototypes
		this.getDate = Date.prototype.getUTCDate;
		this.getDay = Date.prototype.getUTCDay;
		this.getFullYear = Date.prototype.getUTCFullYear;
		this.getHours = Date.prototype.getUTCHours;
		this.getMilliseconds = Date.prototype.getUTCMilliseconds;
		this.getMinutes = Date.prototype.getUTCMinutes;
		this.getMonth = Date.prototype.getUTCMonth;
		this.getSeconds = Date.prototype.getUTCSeconds;
		this.getTimezoneOffset = function(){ return 0; }; //no offset
		this.getYear = function() { return Date.prototype.getUTCFullYear() - 1900; };

		this.setDate = Date.prototype.setUTCDate;
		this.setFullYear = Date.prototype.setUTCFullYear;
		this.setHours = Date.prototype.setUTCHours;
		this.setMilliseconds = Date.prototype.setUTCMilliseconds;
		this.setMinutes = Date.prototype.setUTCMinutes;
		this.setMonth = Date.prototype.setUTCMonth;
		this.setSeconds = Date.prototype.setUTCSeconds;
		this.setTimeout = Date.prototype.setUTCTimeout;
		this.setYear = function(year) { if (!isNaN(year)) this.setFullYear(year + 1900); };

		this.toString = Date.prototype.toUTCString;
		return this;
	};
/*** End UTC/Local conversion support ****************************************/


// Converts from MS-Ajax encoded date-time
// Date.fromMsAjax("\/Date(1246662585000)\/")
//		Fri Jul 03 2009 09:09:45 GMT-0700
Date.fromMsAjax= function(jsonString) {
	var msAjaxFormat = /^\\?\/Date\((\-?\d+)\)\\?\/$/;
	
	if (!jsonString) return null;
	
	if (jsonString instanceof Date) return jsonString; //already a date
	
	jsonString = jsonString.toString().replace(/^\s+/,'').replace(/\s+$/,'');
	if (!msAjaxFormat.test(jsonString.trim()))
		return null; //invalid format

	var dv = jsonString.toString().trim().replace(msAjaxFormat, '$1');
	dv = parseInt(dv,10);
	if (!isNaN(dv)) {
		dv = new Date(dv);
		if (dv.getTime() <= new Date(-62135571600000).getTime()) // CLR DateTime.MinValue
			return null; 
		return dv;
	}
	
	return null; //invalid
};

//Extend the instance prototype for Date objects
Date.prototype.date = function() {
	var ret = new Date(this.getTime());
	ret.setHours(0, 0, 0, 0);
	return ret;
};


Date.prototype.daysElapsed = function() {
	var start = new Date(this.getTime()).date();
	var end = new Date().date();
	var ret = 0;
	if (start < end) {
		while (start < end) {
			ret++;
			start.setDate(start.getDate() + 1);
		}
	} else {
		while (start > end) {
			ret--;
			start.setDate(start.getDate() - 1);
		}
	}
	
	return ret;
};


//Method to create a localized ISO-8601 string with local offset
if (typeof Date.prototype.toLocalISOString != 'function') {
	Date.prototype.toLocalISOString = function() {
		//method to zero-pad a string
		function zpad(len, input) {
			var ret = String(input);
			while (ret.length < len)
				ret = '0' + ret;
			return ret;
		}

		var ret = [
			zpad(4, this.getFullYear())
			,'-',zpad(2, this.getMonth() + 1)
			,'-',zpad(2, this.getDate())
			,'T',zpad(2, this.getHours())
			,':',zpad(2, this.getMinutes())
			,':',zpad(2, this.getSeconds())
			,'.',zpad(3, this.getMilliseconds())
		].join('');
			
		var offset = new Date(0) - new Date(1970,0,1); //offset from UTC to local value.
		if (offset === 0) return ret + 'Z';

		ret += (offset < 0 ? '-' : '+');
			
		if (offset < 0) offset = -offset;
		var offsetmin = Math.floor(offset / (1000 * 60));
		var offsethrs = Math.floor(offsetmin / 60);
		offsetmin = offsetmin % 60;
		ret += zpad(2,offsethrs) + ':' + zpad(2,offsetmin);
			
		return ret;
	};
}

(function(){
	var y = new Date().getFullYear();
	var a = new Date(y, 0, 1).getTimezoneOffset(); //january
	var b = new Date(y, 6, 1).getTimezoneOffset(); //july

	//if the offset is the same, then DST isn't used on this system
	Date.supportsDaylightSavingTime = (a != b);
	Date.isDaylightSavingTime = new Date().getTimezoneOffset() != Math.max(a,b);

	//get the regular offset
	var o = Date.baseUTCOffset = -Math.max(a,b);
	var h = Math.floor(Math.max(o,-o) / 60);
	var m = Math.max(o,-o) % 60;
	h = (h<10) ? "0" + h : h;
	m = (m<10) ? "0" + m : m;

	//setup GMT zone difference
	var tz = "UTC";
	if (o < 0) tz += "-" + h + ":" + m;
	if (o > 0) tz += "+" + h + ":" + m;
	Date.baseUTCOffsetString = tz;
	Date.baseGMTOffsetString = tz.replace("UTC","GMT");
}());
//console.debug("end dateextensions.js");