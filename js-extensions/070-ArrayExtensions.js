//console.debug("begin arrayextensions.js");

/*
Provides array extensions, including JS 1.6 additions.
see: https://developer.mozilla.org/en/Core_JavaScript_1.5_Guide/Working_with_Arrays#Introduced_in_JavaScript_1.6

Static Methods:
	* Array.range() - takes a min and a max input, and returns an array of [min (, ..., max)]
	* Array.fromAny() - forces an object to an array, uses array-like matching, returns an empty array for null/undefined etc.

Index Methods:
	* indexOf() - returns the index of the given item's first occurrence.
	* lastIndexOf() - returns the index of the given item's last occurrence. 

Iterative methods:
	* every() - runs a function on items in the array while that function is returning true. It returns true if the function returns true for every item it could visit.
	* filter() - runs a function on every item in the array and returns an array of all items for which the function returns true.
	* forEach() - runs a function on every item in the array.
	* map() - runs a function on every item in the array and returns the results in an array.
	* some() - runs a function on items in the array while that function returns false. It returns true if the function returns true for any item it could visit. 

Other methods:
	* joinFn(separator, fn) - equivalent to array.map(fn).join(separator) -- used within ART project
*/


/* Static additions to Array */
			//returns an array with a range of integers between and including min and max.
			Array.range = function(min, max) {
				if (isNaN(min)) throw "Argument 'min' is not a number.";
				if (isNaN(max)) throw "Argument 'max' is not a number.";
				var a = (parseInt(min) <= parseInt(max)) ? min : max;
				var b = (a == min) ? max : min;
				var ret  = [];
				for (var i=parseInt(a); i<=parseInt(b) ; i++)
					ret.push(i);
				return ret;
			}


			//returns an array based on an array-like object (arguments, getElements* results etc)
			//used by 1.6 extensions below
			Array.fromAny = function(obj) {
				var ret = [];
				
				//sanity checks
				if (typeof obj === 'undefined' || x === null || x === '') return []; //nothing to empty array
				if (typeof obj === 'array') return obj; //already an array
			
				//test for length property
				var len = parseInt(obj && obj.length, 10);
				
				//length is 0
				if (len === 0) return [];

				//has a .length property, force it to an array
				if (len) {
					//not a DOM tree
					if (!(obj[0] && obj[0].tagName))
						return Array.prototype.slice.call(obj);

					//DOM tree, walk it
					for (var i=0; i<obj.length; i++) {
						if (obj[i]) ret[i] = obj[i];
					}
					return ret;
				} 

				//inspect the object's properties for integer keys
				var tmp = 0;
				for (var x in obj) {
					//don't use null/empty string as 0
					if (typeof x === 'undefined' || x === null || x === '') continue;

					//property is numeric, and an integer (ceil matches floor)
					tmp = Math.floor(x,10);
					if ((tmp || tmp === 0) && tmp == Math.ceil(x)) {
						ret[tmp] = obj[x];
					}
				}
				return ret;
			}



/* Prototype extensions to Array */
			//join by delimiter such that f of item requires map (defined below)
			Array.prototype.joinFn = function(d, fn) {
				return this.map(fn).join(d);
			}




/* Add JavaScript 1.6 extensions to Array if needed. */

			//indexOf(searchElement[, fromIndex) searches the array for searchElement and returns the index of the first match. 
			if (!Array.prototype.indexOf)
			{
				Array.prototype.indexOf = function(elt /*, from*/)
				{
					var len = this.length >>> 0;

					var from = Number(arguments[1]) || 0;
					from = (from < 0)
						? Math.ceil(from)
						: Math.floor(from);
					if (from < 0)
						from += len;

					for (; from < len; from++)
					{
						if (from in this && this[from] === elt)
							return from;
					}
					return -1;
				};
			}

			//lastIndexOf(searchElement[, fromIndex) like indexOf, but starts at the end and searches backwards. 
			if (!Array.prototype.lastIndexOf)
			{
				Array.prototype.lastIndexOf = function(elt /*, from*/)
				{
					var len = this.length;

					var from = Number(arguments[1]);
					if (isNaN(from))
					{
						from = len - 1;
					}
					else
					{
						from = (from < 0)
							? Math.ceil(from)
							: Math.floor(from);
						if (from < 0)
							from += len;
						else if (from >= len)
							from = len - 1;
					}

					for (; from > -1; from--)
					{
						if (from in this && this[from] === elt)
							return from;
					}
					return -1;
				};
			}


			//every(callback[, thisObject]) returns true if callback returns true for every item in the array.
			if (!Array.prototype.every)
			{
				Array.prototype.every = function(fun /*, thisp*/)
				{
					var len = this.length >>> 0;
					if (typeof fun != "function")
						throw new TypeError();

					var thisp = arguments[1] || this;
					for (var i = 0; i < len; i++)
					{
						if (i in this && 
							!fun.call(thisp, this[i], i, this))
						return false;
					}

					return true;
				};
			}


			//filter(callback[, thisObject]) returns a new array containing the items for which callback returned true. 
			if (!Array.prototype.filter)
			{
				Array.prototype.filter = function(fun /*, thisp*/)
				{
					var len = this.length >>> 0;
					if (typeof fun != "function")
						throw new TypeError();

					var res = new Array();
					var thisp = arguments[1] || this;
					for (var i = 0; i < len; i++)
					{
						if (i in this)
						{
							var val = this[i]; // in case fun mutates this
							if (fun.call(thisp, val, i, this))
								res.push(val);
						}
					}

					return res;
				};
			}


			//forEach(callback[, thisObject]) execute callback on every array item. 
			if (!Array.prototype.forEach)
			{
				Array.prototype.forEach = function(fun /*, thisp*/)
				{
					var len = this.length >>> 0;
					if (typeof fun != "function")
						throw new TypeError();

					var thisp = arguments[1] || this;
					for (var i = 0; i < len; i++)
					{
						if (i in this)
							fun.call(thisp, this[i], i, this);
					}
				};
			}


			//map(callback[, thisObject]) returns a new array of the return value from executing callback on every array item. 
			if (!Array.prototype.map)
			{
				Array.prototype.map = function(fun /*, thisp*/)
				{
					var len = this.length >>> 0;
					if (typeof fun != "function")
						throw new TypeError();

					var res = new Array(len);
					var thisp = arguments[1] || this;
					for (var i = 0; i < len; i++)
					{
						if (i in this)
							res[i] = fun.call(thisp, this[i], i, this);
					}

					return res;
				};
			}


			//some(callback[, thisObject]) returns true if callback returns true for at least one item in the array. 
			if (!Array.prototype.some)
			{
				Array.prototype.some = function(fun /*, thisp*/)
				{
					var i = 0,
					len = this.length >>> 0;

					if (typeof fun != "function")
						throw new TypeError();

					var thisp = arguments[1] || this;
					for (; i < len; i++)
					{
						if (
							i in this 
							&&	fun.call(thisp, this[i], i, this)
						)
							return true;
					}

					return false;
				};
			}


			//static methods for array-like objects
			if (!Array.indexOf) {
				Array.every = function(obj, elt, from) {
					var ary = Array.fromAny(obj) || []
					return ary.indexOf(elt, from);
				}
			}
			
			if (!Array.lastIndexOf) {
				Array.lastIndexOf = function(obj, elt, from) {
					var ary = Array.fromAny(obj) || [];
					return ary.lastIndexOf(elt, from);
				}
			}
			
			if (!Array.every) {
				Array.every = function(obj, fun, thisp) {
					var ary = Array.fromAny(obj) || [];
					return ary.every(fun, thisp || ary);
				}
			}
			
			if (!Array.filter) {
				Array.filter = function(obj, fun, thisp) {
					var ary = Array.fromAny(obj) || [];
					return ary.filter(fun, thisp || ary);
				}
			}
			
			if (!Array.forEach) {
				Array.forEach = function(obj, fun, thisp) {
					var ary = Array.fromAny(obj) || [];
					return ary.forEach(fun, thisp || ary);
				}
			}
			
			if (!Array.map) {
				Array.map = function(obj, fun, thisp) {
					var ary = Array.fromAny(obj) || [];
					return ary.map(fun, thisp || ary);
				}
			}
			
			if (!Array.some) {
				Array.some = function(obj, fun, thisp) {
					var ary = Array.fromAny(obj) || [];
					return ary.some(fun, thisp || ary);
				}
			}


//console.debug("end arrayextensions.js");