// highlight a number on any page and right-click to issue dial command
var id = chrome.contextMenus.create({"title": "Dial this number", "contexts":["selection"],"onclick": genericOnClick});

function genericOnClick(info, tab) {
	const webdialNumber = info.selectionText.replace(/\D/g,'') 
	makeCallTo (webdialNumber);
}

function makeCallTo (number) {	
	chrome.storage.sync.get({
		'myExtension': ''
		,'myUrl': ''
	},function(items) {
		myExtension = items.myExtension;
		url = items.myUrl;
		if (myExtension.length < 3 || url.length < 5) {
			chrome.runtime.openOptionsPage();
		} else {
			$.getJSON(url, {mode: "dial", destination: number, xtn: myExtension},
			function(data) {})
			.success(function(data)  {
				console.log (data);
			})
			.error(function(err) {
				console.log (err);
			})
		}
	});
}

console.log ("enable web click");
// ---------------------