/* PAGE is way of organizing your javascript based app. 
* Works great across pages, or in single page apps, extensions, etc etc.
* Works great with other libraries like jQuery.
* Small by design.
* SEE https://github.com/dogstyle/page
*
*
* this JS file adds core features to PAGE which can be added after the initial loader is loaded
*
*
* Created by Justin Kempton
* MIT License
*/

PAGE.extend( function(puppy, dog, log) {

	var emptyFunction = new Function()
		, scriptNumber = 0

	// store jQuery for instanceof, in case it gets overriden by some other code
	if (typeof jQuery !== "undefined" && !dog.jQuery) {
		dog.jQuery = jQuery
	}

	/* method for loading external js scripts, used for testing mostly, 
	* production code should be loading as minified unified code, not here, unless there is a good reason */
	var loadScript = dog.loadScript = function(/* pathToFile, allowCache */) {
		var map = dog.mapArguments(arguments)
			, allowCache = map.Boo ? map.Boo[0] : false

		if (!map.Str) return
		if (map.Str.length > 1) {
			for (var x in map.Str) loadScript(map.Str[x], allowCache)
			return
		}

		var pathToFile = map.Str[0]

		var scriptId = pathToFile.replace(/\./g,"_").replace(/\//g, "_").replace(":","")
			, existingElm = document.getElementById(scriptId)
			, increment = allowCache ? String(scriptNumber++) : (String((Math.random() * 1000)).replace(/\./,""))

		if (existingElm) {
			existingElm.parentElement.removeChild(existingElm)
		}

		var fileref = document.createElement('script')
		fileref.setAttribute("type","text/javascript")
		fileref.setAttribute("src", pathToFile.replace(/^~/,"") + "?" + increment) // increment or randomize
		fileref.setAttribute("id", scriptId)
		document.getElementsByTagName("head")[0].appendChild(fileref)

		return puppy
	}

	/* adding this to be able to load styles too, for simplifying my life with bundling debugging */
	var loadStyle = dog.loadStyle = function(/* pathToFile, allowCache */) {
		var map = dog.mapArguments(arguments)
		, allowCache = map.Boo ? map.Boo[0] : false

		if (!map.Str) return puppy
		if (map.Str.length > 1) {
			for (var x in map.Str) loadStyle(map.Str[x], allowCache)
			return puppy
		}

		var pathToFile = map.Str[0]
			, scriptId = pathToFile.replace(/\./g,"_").replace(/\//g, "_").replace(":","")
			, existingElm = document.getElementById(scriptId)
			, increment = allowCache ? String(scriptNumber++) : (String((Math.random() * 1000)).replace(/\./,""))

		if (existingElm) {
			existingElm.parentElement.removeChild(existingElm)
		}

		var fileref = document.createElement('link')
		fileref.href = pathToFile.replace(/^~/,"") + "?" + increment
		fileref.id = scriptId
		fileref.rel = "stylesheet"

		document.getElementsByTagName("head")[0].appendChild(fileref)

		return puppy
	}

	/* method for loading external libries, that get dumped into the PAGE.Lib object. 
	* loaded scripts must be added to the window object, and the name must be set in the globalVarName
	* Use for testing. Production code should load as bundled minified code */
	dog.AddExternalLib = dog.addExternalLib = function(path, globalVarName, callback) {

		var thing = dog.exists(globalVarName, window)

		if (thing) {
			typeof callback === "function" && callback(thing)
			return puppy
		}

		dog.loadScript(path, false)

		dog.waitExists(globalVarName, window, function(glob) {
			puppy.add("Lib." + globalVarName, glob)
			typeof callback === "function" && callback(glob)
		})

		return puppy
	}

	/* take a path and check against a the global window variable by default, or set in another variable 
	*
	* for example: waiting for a jquery addon to load
	* PAGE.waitWindow("jQuery.fn.SomeAddon", true, function() {
	*     ... your code here
	* })
	*
	* will add the following as soon as it's finished loading
	* PAGE.Lib.SomeAddon
	*
	* by passing in a object, when it's ready, callback returns it 
	 * add is boolean and optional, add it to the Lib 
	 * callback is function and optional returns the thing */

	dog.waitWindow = function(/* path, add, obj, callback */) {

		var map = dog.mapArguments(arguments)
		, callback = map.Fun ? map.Fun[0] || function(){} : function(){}
		, add = map.Boo ? map.Boo[0] || false : false
		, path = map.Str ? map.Str[0] : undefined
		, obj = map.Obj ? map.Obj[0] : window

		var name = (function() {
			if (!path) {
				return "undefined" + String(Math.random()).replace(".","")
			}

			var arr = path.split(".")
			if (!arr.length) {
				return name
			} else {
				return arr.reverse()[0]
			}
		}())

		dog.waitExists(path, obj, function(thing) {
			if (add) PAGE.spawn("Lib." + name, thing)
			callback(thing)
		})
	}

	/* add a whole bunch of global variables to the PAGE.Lib, return when they are done loading */
	dog.batchWaitWindow = function(/* path, path, arr, path, add, callback */) {
		var waitCount = 1
			, paths = []
			, obj = window
			, callback = function(){}

		function finished() {
			waitCount -= 1
			if (!waitCount) callback(PAGE.Lib)
		}

		var map = dog.mapArguments(arguments)
		if (map.Fun) callback = map.Fun[0]
		if (map.Boo) add = map.Boo[0]
		else add = true
		if (map.Obj) obj = map.Obj[0]
		if (map.Arr) {
			for(var x in map.Arr) paths = paths.concat( map.Arr[x] )
		}
		if (map.Str) paths = paths.concat(map.Str)

		waitCount = paths.length

		for(var y in paths) {
			dog.waitWindow(paths[y], add, obj, finished)
		}
	}

	/* remove from page, and from base, and maybe swap it for this, return old */
	dog.remove = function (path, base, swap) {
		if (typeof path === "undefined" || typeof path === "object") return
		var arr = path.split(".")
			, x = 0
			, obj = base || puppy

		if (arr.length < 1) return

		while (x < arr.length) {

			if (x === arr.length - 1) {
				var hold = obj[arr[x]]
				if (swap) {
					obj[arr[x]] = swap
				} else {
					delete obj[arr[x]]
				}
				return hold
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

	/* used in testing, to swap out existing libraries for mock libraries
	// call it like this
	//	var swap = PAGE.SwapLib({
	//		"Modules.dataService" : {}
	//		, "Modules.commonMessage" : { someMethod : function(){} }
	//		, "Constructors.YourConstructor" : function(){}
	//		, "Constructors.AnotherConstructor" : function(){}
	//	})
	//
	//	then to return, do swap.restore() */
	dog.SwapLib = function(hash, base) {

		base = base || puppy

		var pup = {
			restore : undefined // function(){}
			, store : {}
		}

		function init() {

			for (var x in hash) {
				pup.store[x] = dog.remove(x, base, hash[x])
			}

		}

		pup.restore = function() {
			for (var x in pup.store) {
				dog.spawn(x, pup.store[x])
				delete pup.store[x]
			}
		}

		init()

		return pup
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
	dog.stash = function(key) {
		if (key) window[key] = puppy
		if (!dog.pointers) dog.pointers = {}
		else {
			for(var x in dog.pointers) delete window[x]
		}
		dog.pointers[key] = true
		delete window.PAGE
		return puppy
	}

})
