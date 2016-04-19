// highlight a number on any page and right-click to issue dial command
var id = chrome.contextMenus.create({"title": "Dial this number", "contexts":["selection"],"onclick": genericOnClick});
const dialerURL = 'http://pbx.domain.local/phonebookDialer.php';

function genericOnClick(info, tab) {
	const webdialNumber = info.selectionText.replace(/\D/g,'') 
	makeCallTo (webdialNumber);
}

function makeCallTo (number) {	
	chrome.storage.sync.get({'myExtension': ''}, function(items) {
		myExtension = items.myExtension;
		if (myExtension.length < 3) {
			chrome.runtime.openOptionsPage();
		} else {
			$.getJSON(dialerURL, {mode: "dial", destination: number, xtn: myExtension},
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

// ---------------------