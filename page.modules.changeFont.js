PAGE.addWait(
	"Modules.changeFont"
	, [
		"Modules.symbols"
	]
	, function (ref) {

		var e_root = document.getElementById("changeFont")

		var dog = {
			e_root : e_root
			, e_select : e_root.querySelector("select")
			, e_main : document.querySelector(".Main")
		}

		function events() {
			dog.e_select.addEventListener("change", function(e) {
				dog.e_main.style.fontFamily = e.target.value
			})
		}

		events()

		return dog

	})
