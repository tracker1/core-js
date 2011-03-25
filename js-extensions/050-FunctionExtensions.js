//console.debug("begin functionextensions.js");

//define a single reference for an empty function
if (typeof Function.empty == 'undefined')
	Function.empty = function(){};

//EcmaScript 5 Function.prototype.bind
if (typeof Function.prototype.bind != "function")
Function.prototype.bind = function() {
	var	slice = Array.prototype.slice
		,method = this
		,args = slice.call(arguments)
		,context = args.shift()
	return function() {
		method.apply(context, args.concat(slice.call(arguments)));
	}
};

//JavaScript implementation of partial
if (typeof Function.prototype.partial == "undefined")
Function.prototype.partial = function() {
	var	slice = Array.prototype.slice
		,method = this
		,args = slice.call(arguments)
		,partial = function() {
			return method.apply(this, args.concat(slice.call(arguments)));
		}
	//override unpartial property to return original function
	partial.unpartial = function() {
		return method;
	}
	return partial;
};

//unpartial, when overriden gets a back reference to the original method used
if (typeof Function.prototype.unpartial != "function")
Function.prototype.unpartial = function() {
	return this; //to be overriden by partial
}


//curry - use partial
if (typeof Function.prototype.curry != "function")
Function.prototype.curry = Function.prototype.partial;

//uncurry - return base function used.
if (typeof Function.prototype.uncurry != "function")
Function.prototype.uncurry = function() {
	return this.unpartial();
}

//console.debug("end functionextensions.js");