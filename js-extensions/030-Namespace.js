/*
Script Name: Javascript Namespace Script
Author: Michael J. Ryan (http://tracker1.info)

Public Domain

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  
*/
//console.debug("begin namespace.js");
(function(root){
	//regular expression to limit formatting of namespaces
	var nsre = /^([\$\_a-z][\$\_a-z\d]*\.?)+$/i

	//define returned function
	this.namespace = function(ns) {
		var args = Array.prototype.slice.call(arguments);
		var ret = [];
		while (args.length) {
			ns = genNS(args.shift());
			if (ns) ret.push(ns);
		}
		if (ret.length == 0) return; //undefined, no valid input
		if (arguments.length == 1) return ret[0]; //only a single input, return that namespace
		return ret; //used overload for multiple namespaces, return the array/list
	}
	
	//private static method to generate a single namespace
	function genNS(ns) {
		if (!ns.match(nsre)) return;
		ns = ns.split('.');
		var base = root;
		for (var i=0; i<ns.length; i++) {
			base[ns[i]] = base[ns[i]] || {};
			base = base[ns[i]];
		}
		return base; //return resulting namespace object
	}
}(this));
//console.debug("end namespace.js");