PAGE.add("Constructors.BuildSymbols", function BuildSymbols(e_root, e_toc, settings) {

	settings         = settings         || {}
	settings.length  = settings.length  || 10000
	settings.debug   = settings.debug   || false
	settings.start   = settings.start   || 33
	settings.delay   = settings.delay   || 2
	settings.navMode = settings.navMode || false

	var f = new Function()
	var dog = {
		createSymbol : f
		, buildArray : f
		, buildRange : f
		, buildGroupRange : f
		, addToc : f
		, options : settings
		, e_root : e_root
		, e_toc : document.getElementById("toc")
	}

	function cleanName(name) {
		return name.replace(" ","-").toLowerCase()
	}

	dog.createSymbol = function(e_parent, code, callback) {
		var hexCode = "&amp;#x" + code.toString(16) + ";"
			, decCode = code.toString(10)
			, formattedCode = "&#x" + code.toString(16) + ";"
			, e_html = document.createElement("span")
			, e_i = document.createElement("i")
			, e_b = document.createElement("b")

		e_html.className = "symbol"
		e_html.title = decCode

		e_i.innerHTML = hexCode
		e_b.innerHTML = formattedCode

		e_html.appendChild(e_i)
		e_html.appendChild(e_b)

		e_parent.appendChild(e_html)

		return e_html
	}

	dog.buildArray = function(heading, arr) {

		var e_html = document.createElement("div")
			, e_heading = document.createElement("h1")
			, e_count = document.createElement("em")

		e_html.className = cleanName(heading)
		e_heading.innerHTML = cleanName(heading)
		e_heading.appendChild(e_count)

		if (dog.options.navMode) {
			dog.e_root.innerHTML = ""
		}

		dog.e_root.appendChild(e_heading)

		if(arr && arr.length > 0) {
			for(var x=0; x < arr.length; x++) {
				dog.createSymbol(e_html, arr[x])
			}
		}

		dog.e_root.appendChild(e_html)

		if (!dog.options.navMode) {
			dog.addToc(heading, cleanName(heading))
		}

		return dog
	}

	dog.buildRange = function(start, end, callback) {

		settings.debug.debug && console.log("buildRange")
		var x      = start || 33
			, length = end   || settings.length
			, html   = ""

		for (x; x <= length; x++) dog.createSymbol(dog.e_root, x)
		return dog
	}

	dog.buildGroupRange = function(heading, start, end, count) {

		if (dog.options.navMode) {
			dog.e_root.innerHTML = ""
		}

		var e_heading = document.createElement("h1")
		, e_count = document.createElement("em")

		e_count.innerHTML = count
		e_heading.innerHTML = cleanName(heading)
		e_heading.appendChild(e_count)

		dog.e_root.appendChild(e_heading)

		dog.buildRange(start, end)

		if (!dog.options.navMode) {
			dog.addToc(heading, cleanName(heading))
		}

		return dog
	}

	dog.addToc = function(title, link) {
		var e_link = document.createElement("a")

		e_link.innerHTML = title
		e_link.href = "#" + link

		if (dog.e_toc)
			dog.e_toc.appendChild(e_link)

		e_link.addEventListener("click", function(e) {

			var siblings = e.target.parentNode.children
			for (var x = siblings.length; x--;)
				siblings[x].className = ""

			e.target.className = "Selected"

		})

		return dog
	}

	return dog

})
