PAGE.extend(function(puppy, dog, log) {

	dog.ext = dog.ext || {}

	var ajax = dog.ajax = dog.ext.ajax = {}

	ajax.send = function(url, callback, method, data, sync) {
		var x = new XMLHttpRequest()
		x.open(method, url, sync)
		x.onreadystatechange = function() {
			if (x.readyState == 4) {
				callback(x.responseText)
			}
		}
		if (method == 'POST') {
			x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
		}
		x.send(data)
	}

	ajax.get = function(url, data, callback, sync) {

		var query = []
		for (var key in data) {
			query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
		}
		ajax.send(url + '?' + query.join('&'), callback, 'GET', null, sync)
	}

	ajax.post = function(url, data, callback, sync) {
		var query = []
		for (var key in data) {
			query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
		}
		ajax.send(url, callback, 'POST', query.join('&'), sync)
	}

})
