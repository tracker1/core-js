
//console.debug("begin stringextensions.js");
//Extensions for strings
//	Created by Michael J. Ryan - 2009-10-20

//empty string reference
String.empty = "";

//trim functionality -- see: http://blog.stevenlevithan.com/archives/faster-trim-javascript
if (typeof String.prototype.ltrim == "undefined")
String.prototype.ltrim = function() {
	return this.replace(/^\s+/,"");
};
if (typeof String.prototype.rtrim == "undefined")
String.prototype.rtrim = function() {
	var	ws = /\s/;
	var i = this.length;
	while (ws.test(this.charAt(--i))){};
	return this.slice(0, i+1);
};
if (typeof String.prototype.trim == "undefined")
String.prototype.trim = function() {
	return this.ltrim().rtrim();
};


//convert anything to a trimmed string (converts null and undefined to String.empty)
if (typeof String.fromAny == "undefined")
String.fromAny = function(input) {
	//localise the input
	var ret = input;
	
	//if ret is undefined or null, use an empty string
	if (typeof(ret) == "undefined" || ret === null)
		ret = "";
		
	//ensure that objects are converted, and trim the result.
	return ret.toString().trim();
};


//make sure there's a toLocaleLowerCase, use toLowerCase if needed
if (typeof String.prototype.toLocaleLowerCase == "undefined")
if (typeof(String.prototype.toLocaleLowerCase) != "function")
	String.prototype.toLocaleLowerCase = String.prototype.toLowerCase;


//creates a trimmed string, lowercased for comparisons
if (typeof String.toCmp == "undefined")
String.toCmp = function(input) {
	return String.fromAny(input).toLocaleLowerCase();
};


//case insensitive matching for strings
if (typeof String.equals == "undefined")
String.equals = function(s1, s2) {
	return String.toCmp(s1) == String.toCmp(s2);
};
if (typeof String.prototype.equals == "undefined")
String.prototype.equals = function(s2) {
	return String.equals(this, s2);
};

//search within a string, or array of strings
if (typeof String.contains == "undefined")
String.contains = function(s1, s2) {
	//matching against an array
	if (typeof(s1) == "array") {
		var search = String.toCmp(s2);
		for (var i=0; i<s1.length; i++) {
			if (String.toCmp(s1[i]).indexOf(search) >= 0)
				return true;
		}
		return false;
	}
	
	//matching against strings
	return String.toCmp(s1).indexOf(String.toCmp(s2)) >= 0;
};
if (typeof String.prototype.contains == "undefined")
String.prototype.contains = function(s2) {
	return String.contains(this, s2);
};

//reverse of contains
if (typeof String.inside == "undefined")
String.inside = function(s1, s2) {
	return String.contains(s2, s1);
};
if (typeof String.prototype.inside == "undefined")
String.prototype.inside = function (s2) {
	return String.inside(this, s2);
};


//console.debug("end stringextensions.js");