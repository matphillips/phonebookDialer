// Phonebook Dialer.
// (c) Mat Phillips 2016

function save_options() {
	var myExtension = $('#myExtension').val();
	
	chrome.storage.sync.set({'myExtension': myExtension}
	,function() {
		$('#phonebookOptionsStatus').html("Options saved");
 		setTimeout(function() {
			$('#phonebookOptionsStatus').html("");
			status.textContent = '';
		}, 1750);
	});
}

function restore_options() {
	chrome.storage.sync.get({'myExtension': ''}
	,function(items) {
		$('#myExtension').val(items.myExtension);
	});
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
