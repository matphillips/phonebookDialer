// Phonebook Dialer.
// (c) Mat Phillips 2016

$(document).ready(function() {
	var url;
	var myExtension;
	var phonebookData = [];
	
	chrome.storage.sync.get({
		'myExtension': ''
		,'myUrl': ''
	},function(items) {
		myExtension = items.myExtension;
		url = items.myUrl;
		if (myExtension.length < 3 || url.length < 5) {
			chrome.runtime.openOptionsPage();
		} else {
			launch()
		}
	});
	
	function launch() {
		phonebookData = fetchPhonebookData();
		$("#phonebookSearchField").on("keyup", function () {
			updateDisplay();
		})
	}
	
	function addResult(name, numbers) {
		var numberList = [];
		$.each(numbers, function(index, value) {
			numberList = `${numberList}
			<div class = "phonebookEntry">
				<span class = "type">${value["type"]}:</span>
				<span class = "number" data-number="${value['number']}">${value["number"]}</span>
			</div>
			`;
		});
		
		const element = `
		<div class = "phonebookResult">
			<span class = "name">${name}</span>
			<span class = "numbers">
				<span>${numberList}</span>
			</span>
		</div>
		`;
		return element;
	}

	function fetchPhonebookData(sampledata) {		
		$.getJSON(url, {mode: "list", xtn: myExtension},
		function(data) {})
		.success(function(data)  {
			phonebookData = []; // clear the array before repopulating it
			$.each(data, function(key, value) {
				console.log (1);			
				phonebookData[phonebookData.length] = {xname: value["name"], xnumbers: value["numbers"]};
			});	
			updateDisplay()
		})
		.error(function(err) {
			console.log (err);
		})
	}
	
	function filterBySearch(obj) {
		const searchString = $("#phonebookSearchField").val();
		if ( ('xname' in obj && obj.xname.toLowerCase().indexOf(searchString.toLowerCase()) > -1) || ('xnumber' in obj && obj.xnumber.indexOf(searchString) > -1) ) {
			return true;
		} else {
			return false;
		}
	}
	
	function updateDisplay() {
		$("#phonebookSearchResults").empty();
		const filteredData = phonebookData.filter(filterBySearch);
		$.each(filteredData, function(key, value) {			
			const el = addResult(value.xname, value.xnumbers);
			$("#phonebookSearchResults").append(el);
		});
		$(".phonebookEntry").off().on("click", function() {
			const number = $(this).find($('.number')).data("number");
			$("#phonebookSearchField").val("");
			makeCallTo (number);
		});
	}
	
	function makeCallTo (number) {
		$("#phonebookSearchResults").empty().append(`<div class = "phonebookResult">Calling: ${number} <div>`);	
		if (myExtension && number) {
			$.getJSON(url, {mode: "dial", destination: number, xtn: myExtension},
			function(data) {})
			.success(function(data)  {
				console.log (data);
			})
			.error(function(err) {
				console.log (err);
			})
		}	
	}
});
