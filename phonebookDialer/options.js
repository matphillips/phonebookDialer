// Phonebook Dialer.
// (c) Mat Phillips 2016

function save_options() {
	var myExtension = $('#myExtension').val();
	var myUrl = $('#myUrl').val();
	chrome.storage.sync.set({
		'myExtension': myExtension
		,'myUrl': myUrl
	}
	,function() {
		$('#phonebookOptionsStatus').html("Options saved");
 		setTimeout(function() {
			$('#phonebookOptionsStatus').html("");
			status.textContent = '';
		}, 1750);
	});
}

function restore_options() {
	chrome.storage.sync.get({
		'myExtension': ''
		,'myUrl': 'http://pbx.example.local/phonebookDialer.php'
	}
	,function(items) {
		$('#myExtension').val(items.myExtension);
		$('#myUrl').val(items.myUrl);
	});
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
