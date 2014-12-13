/* PAGE is way of organizing your javascript based app. 
* Works great across pages, or in single page apps, extensions, etc etc.
* Works great with other libraries like jQuery.
* Small by design.
* SEE https://github.com/dogstyle/page
* Created by Justin Kempton
*
*
*
* This is the loader for the PAGE library, it should either be part of the bundled (compressed javascript) or on the html page itself
*
*
* MIT License
*/
;(function() {

var PAGE = (function() {

	var emptyFunction = new Function()

	// check for console
	if (!window.console) {
		window.console = {
			log : emptyFunction
			, error : emptyFunction
			, groupCollapsed : emptyFunction
			, groupEnd : emptyFunction
			, info : emptyFunction
			, table : emptyFunction
		}
	}

	/* 
	* the point of PAGE is to be able to open up a javascript console, type PAGE and see everything you've loaded.
	* For large complex projects this can be very helpful during the debugging process.
	* In addition, with PAGE.test.js (jdog), you have integrated code coverage testing
	*
	* For most things, PAGE.add, PAGE.add$, and PAGE.wait are all you need.
	*
	* To add to your PAGE object use PAGE.add("GROUPNAME.THING", THING)
	*
	* Example:
	* PAGE.add("Constructors.MyThing", function(options) {
	* var dog = {}
	* return dog
	* })
	* 
	* to retrieve instance items use PAGE.wait
	* for instance properties PAGE.wait("GROUPNAME.THING", function(THING) {})
	* for prototype PAGE.wait("THING", function(THING) {})
	*
	* To add more functionality to PAGE itself, use PAGE.extend(function(puppy, dog, log)
	* Puppy is the instance, Dog is the Prototype, and Log is for logging.
	*
	* for example, adding a function
	* PAGE.add("Functions.myFunction", function() {
	* alert("dog is great!")
	* })
	*
	* for example, a singleton, what I commonly call 'Modules'
	* PAGE.add("Modules.myModule", (function() {
	* var dog = {}
	* return dog
	* })())
	*
	* for example, a constructor
	* PAGE.add("Constructors.MyConstructor", function() {
	* var dog = {
	*  love : "trucks"
	* }
	* function init() {
	* alert("dogs love " + dog.love)
	* }
	* init()
	* return dog
	* })
	*
	*/

	var Page = function(){}                // base constructor
		, dog = Page.prototype = {}          // base prototype
		, puppy = new Page()                 // base instance
		, speedOfInterval = 150              // speed of interval
		, waitList = dog.waitList = {}       // list of things we are waiting for
		, finishedCallbacks = []             // array of callbacks to run when everything is loaded
		, done = dog.done = function(func) { // method to add to finished callback
			finishedCallbacks.push(func)
		}

	/* internal function calling all done callbacks when everything is finished loading */
	function runFinishedCallbacks() {
		if (checkWaitingList()) return
		for(var x in finishedCallbacks) finishedCallbacks[x](puppy, dog, log)
	}

	/* methods for checking if finished loading */
	function checkWaitingList() {
		var count = 0
		for(var x in waitList) if (!waitList[x]) count++
		return count
	}

	/* logging for everything, gets passed into extend */
	var log = dog.log = function(thing) {
		console.log(thing)
	}

	// store jQuery for instanceof, in case it gets overriden by some other code
	if (typeof jQuery !== "undefined") {
		dog.jQuery = jQuery
	}

	/* this is the method to add stuff to your app, 
	* example usage: 
	* PAGE.add("Constructors.MyConstructor", function($root, options) { 
	* ... 
	* }) 
	* */
	dog.add = function(path, obj) {
		return dog.spawn(path, obj)
		// used to be much bigger, was removed yea!
	}

	/* gather all of the required libraries in an array, push them into the anonymous function */
	dog.addWait = function(path, arrayOfRequiredLibraries, fun) {
		dog.batchWaitRef(arrayOfRequiredLibraries, {}, function(ref) {
			dog.add(path, fun(ref))
		})
	}

	/* gather all of the required libraries in an array, push them into the anonymous function */
	dog.addWait$ = function(path, arrayOfRequiredLibraries, fun) {

		PAGE.waitExists("jQuery", window, function() {
			$(document).ready(function() {
				dog.batchWaitRef(arrayOfRequiredLibraries, {}, function(ref) {
					dog.add(path, fun(ref))
				})
			})
		})

	}

	// allow putting multiple paths into the standard wait function
	dog.wait = function(/* path, path2, path3, callback, refObj */) {
		var map = mapArguments(arguments)
		if (map.Str && map.Obj && !map.Arr) return dog.batchWait.apply(this, arguments)
		else return waitExists.apply(this, arguments)
	}

	/* this is for extending the PAGE class itself, giving access to the prototype
	* example usage
	* PAGE.extend(function( instance, proto, log ) {
	* proto.Image = {
	*   upload : function() {}
	* }
	* }) */
	dog.extend = function extend(callback) {
		typeof callback === "function" && callback(puppy, dog, log)
	}

	/* special case for adding stuff after jquery has loaded, we all love jquery!
	* example usage :
	* PAGE.add$("Modules.myPage", (function() {
	* ...
	* }()))
	* */
	dog.add$ = function(path, thing) {
		var args = arguments
			, ret = {}

		PAGE.waitExists("jQuery", window, function() {
			$(document).ready(function() {
				ret = dog.add.apply(this, args)
			})
		})

		return thing
	}

	/* immediate check to see if something exists, if so, return it, otherwise return undefined
	* example usage
	* var shoppingCart = PAGE.exists("Properties.ShoppingCart")
	*/
	var exists = dog.exists = function (path, base, alternate) {
		if (typeof path === "undefined" || typeof path === "object") return
		var arr = path.split(".")
			, x = 0
			, obj = base || puppy

		if (arr.length < 1) return alternate

		while (x < arr.length) {
			obj = obj[arr[x]]
			if (obj === undefined || obj === null) return alternate
			x++
		}
		if (typeof obj !== "undefined") 
			return obj
		else
			return alternate
	}

	/* the inverse of exists is spawn */
	dog.spawn = function (path, thing, base) {
		if (typeof path === "undefined" || typeof path === "object") return
		var arr = path.split(".")
			, x = 0
			, obj = base || puppy

		if (arr.length < 1) return

		while (x < arr.length) {

			if (x === arr.length - 1) {
				obj[arr[x]] = thing
				return thing
			} else {
				if (obj[arr[x]] === undefined) {
					obj = obj[arr[x]] = { }
				} else {
					obj = obj[arr[x]]
				}
			}
			x++
		}
	}

	/* waitExists --- wait for something to exist then do something 
	* oh my, so simple!, perhaps I will replace the other wait features with this one!
	* this would work for any kind of path
	*/
	
	var waitExists = dog.waitExists = function(path, base, func) {
		var thing
			, limit = 100
			, count = 0
			, interval

		if (typeof base === "function") {
			func = base
			base = undefined
		}

		if (path.search(/window\./) === 0) {
			base = window
		}

		thing = dog.exists(path, base)

		waitList[path] = false

		if (thing) {
			typeof func === "function" && func(thing)
			waitList[path] = true
			runFinishedCallbacks()
			return thing
		}
		interval = setInterval(function() {
			count++
			if (count > limit) {
				console.error("could not find " + path)
				clearInterval(interval)
				return
			}
			var thing = dog.exists(path,base)
			if (thing) {
				typeof func === "function" && func(thing)
				waitList[path] = true
				clearInterval(interval)
				runFinishedCallbacks()
			}
		}, speedOfInterval)
	}

	/* Load a whole batch of things, pass in array and object, object gets filled by things (by reference), or optionally calls back with the object when it's done. */
	dog.batchWaitRef = function(arr, ref, callback) {
		var count = 0
			, ref = ref || {}
		for (var x = 0; x < arr.length; x++) {
			;(function(index, arr) {
				waitExists(arr[index], function(f) {
					count += 1
					var name = arr[index].split(".").reverse()[0]
					ref[name] = f
					if (count >= arr.length) {
						typeof callback === "function" && callback(ref)
					}
				})
			}(x, arr))
		}
		return puppy
	}

	// this is the lazier, and slower version
	dog.batchWait = function(/* str, str2, str3, obj, callback */) {
		var arr = [] 
			, ref = {}
			, map = mapArguments(arguments)
			, callback

		if (map.Fun) callback = map.Fun[0]
		if (map.Str) arr = map.Str
		if (map.Obj) ref = map.Obj[0]
		if (map.Arr) arr.concat(map.Str)

		dog.batchWaitRef(arr, ref, callback)
	}

	/* basic method to hide the PAGE object from prying eyes, should be called on done.
	* But it could be called multiple times, and with complex logic, that when minified will make it tough for
	* some kind of hacker to understand what your code is doing. Then again, it's javascript, everything is available
	* so if you really want security, protect the server side code.
	*
	* PAGE.done(function() {
	*   PAGE.stash("secretName")
	* })
	*
	* if you are going to call this in your code, it's important to also save a local reference to the PAGE object, or it will break
	*/

	var getType = dog.getType = function(thing){
		var shorten = "StringBooleanArrayObjectNumberFunction"
			, ret
    if(thing===null) return "Null"
		if(typeof thing === "object" && window.jQuery && thing instanceof window.jQuery) return "jQuery"
    ret = Object.prototype.toString.call(thing).slice(8, -1)
		if (shorten.indexOf(ret) > -1)
			return ret.substr(0,3)
		else
			return ret
	}

	function pushInObj(name, item, obj) {
		if (!obj[name]) obj[name] = []
		obj[name].push(item)
	}

	var mapArguments = dog.mapArguments = function(args) {
		var map = {}

		for(var y = 0; y < args.length; y++)
			pushInObj(getType(args[y]), args[y], map)

		return map
	}

	document.addEventListener('DOMContentLoaded', function() {
		dog.ready = true
	}, false);

	dog.version = "2.0.2"

	// now we return the whole puppy!
	return puppy

}())

// We are going with PAGE here, as the name
window.PAGE = window.jDog = PAGE

}())


