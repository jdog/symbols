PAGE.addWait(
	"Modules.symbols"
	, [ 
		"Constructors.BuildSymbols" 
		, "ext.ajax"
	]
	, function(ref) {

		var f = Function()
		, dog = {
			symbols : undefined
			, dataHash : {}
		}

		function makeNumber(str) {
			var part = str.substr(2)
			return parseInt(part, 16)
		}

		function build(url, callback) {

			ref.ajax.get(
				url
				, null
				, function(raw) {
					var data = JSON.parse(raw)
						, blocks = data.Blocks

					for (var x in blocks)
					(function(index, item, arr) {

						if (item.Disabled)
							return

						// add it to the global array
						dog.dataHash[item.Name] = item

						dog.symbols.addToc(item.Name, item.Name)

					}(x, blocks[x], blocks))

					;(callback || f)()

				})

		}

		function readHash(e) {
			var hash = location.hash
				, name = hash.substr(1)
				, item = dog.dataHash[name]
				, e_toc_items = dog.symbols.e_toc.children
				, e_current_nav

			for (var x = e_toc_items.length; x--;)
				if (e_toc_items[x].innerHTML === name) {
					e_current_nav = e_toc_items[x]
				}

			if (e_current_nav) {
				e_current_nav.className = "Selected"
			} else {
				e_current_nav.className = ""
			}

			dog.symbols.buildGroupRange(
				item.Name
				, makeNumber(item.Start)
				, makeNumber(item.End)
				, item.Count
			)

			dog.symbols.e_root.parentNode.scrollTop = 0

			return e_current_nav
		}

		function events() {
			window.addEventListener("hashchange", function(e) {
				var e_nav_element = readHash(e)
			})

			if (location.hash) {
				var e_nav_element = readHash()
				e_nav_element.scrollIntoView()
				e_nav_element.parentNode.scrollTop -= ((window.outerHeight / 2) - 70)
			} else {

				var item = dog.dataHash["basic_latin"]

				dog.symbols.buildGroupRange(
					item.Name
					, makeNumber(item.Start)
					, makeNumber(item.End)
					, item.Count
				)

			}

		}

		function init() {

			// instantiate symbols
			var symbols = dog.symbols = ref.BuildSymbols(
				document.getElementById("symbols")
				, document.getElementById("toc")
				, {
					navMode : true
				}
			)

			build("unicode_blocks.json", function() { 
				events()
			})

		}

		init()

		return dog

	})
