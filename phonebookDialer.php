<?php
// Phonebook Dialer.
// (c) Mat Phillips 2016

// ----- configure values:
$startExtension = 200; // lowest extension number
$endExtension = 399;   // highest extension number
$startGroup = 500;     // lowest group number
$endGroup = 520;       // highest group number
// -----

$xtn = array_key_exists('xtn', $_GET) ? $_GET['xtn'] : NULL;
$mode = array_key_exists('mode', $_GET) ? $_GET['mode'] : "list";
header ("content-type: text/xml");
header('Access-Control-Allow-Origin: *');
if (!@include_once(getenv('FREEPBX_CONF') ? getenv('FREEPBX_CONF') : '/etc/freepbx.conf')) {
	include_once('/etc/asterisk/freepbx.conf');
}

if ($mode == "list") {
	global $db;
	$sql = "
		SELECT /* regular extension numbers */
			users.name AS 'name'
			,users.extension
			,'xtn' AS 'type'
		FROM users 
		WHERE extension BETWEEN $startExtension AND $endExtension
		UNION
		SELECT /* additional cell numbers */
			userman_users.displayname AS 'name'
			,userman_users.cell AS 'number'
			,'Cell' AS 'type'
		FROM userman_users
		WHERE userman_users.cell IS NOT NULL
		UNION
		SELECT /* additional work numbers */
			userman_users.displayname AS 'name'
			,userman_users.work AS 'number'
			,'Work' AS 'type'
		FROM userman_users
		WHERE userman_users.work IS NOT NULL
		UNION
		SELECT /* additional fax numbers */
			userman_users.displayname AS 'name'
			,userman_users.fax AS 'fax'
			,'Fax' AS 'type'
		FROM userman_users
		WHERE userman_users.fax IS NOT NULL
		UNION
		SELECT /* additional home numbers */
			userman_users.displayname AS 'name'
			,userman_users.home AS 'number'
			,'Home' AS 'type'
		FROM userman_users
		WHERE userman_users.home IS NOT NULL
		UNION
		SELECT /* ring groups */
			ringgroups.description AS 'name'
			,ringgroups.grpnum
			,'Group' AS 'type' 
		FROM ringgroups 
		WHERE grpnum < 599
		UNION
		SELECT /* custom contacts */
			CONCAT(contactmanager_group_entries.displayname, ' (custom)') AS 'name'
			,contactmanager_entry_numbers.number
			,contactmanager_entry_numbers.type AS 'type'
		FROM contactmanager_groups 
		LEFT JOIN contactmanager_group_entries ON contactmanager_groups.id = contactmanager_group_entries.groupid
		LEFT JOIN contactmanager_entry_numbers ON contactmanager_group_entries.id = contactmanager_entry_numbers.entryid 
		WHERE contactmanager_groups.name = '$xtn'
		ORDER BY name, type DESC
	";
	$results = $db->getAll($sql, DB_FETCHMODE_ORDERED);
	$numrows = count($results);
	$data = array();
	$oldName = "";
	$numbersArray = array();
	for ($i=0; $i < $numrows; $i++) {
		$number = $results[$i][1];
		$name = $results[$i][0];
		$type = $results[$i][2];
		if ($name && $number) {
			if ($name != $oldName && $oldName != "") {
				array_push(
					$data, array(
						"name" => $oldName,
						"numbers" => $numbersArray
					)
				);
				$numbersArray = array();
			}
			array_push(
				$numbersArray, array(
					"type" => $type,
					"number" => $number
				)	
			);
			$oldName = $name; 
		}
	}
	echo json_encode($data, JSON_HEX_QUOT | JSON_HEX_TAG);
}

if ($mode == "dial") {
	global $astman;
	$destination = array_key_exists('destination', $_GET) ? $_GET['destination'] : "";
	
	$strContext = "from-internal";
	$strWaitTime = "30";
	$strPriority = "1";
	$strMaxRetry = "1";
	$strAsync = 'no';
	
	if (strlen($destination) > 2 && strlen($xtn) > 2) {
		$destination = filter_var($destination, FILTER_SANITIZE_NUMBER_INT);
		$destination = preg_replace("/[^0-9,.]/", "", $destination);

		$dial = array();
		$dial['Channel'] = $strChannel;
		$dial['Context'] = $strContext;
		$dial['Exten'] = $destination;
		$dial['Priority'] = $strPriority;
		$dial['Async'] = $strAsync;
		$dial['Timeout'] = $strWaitTime;
		$dial['CallerID'] = '"Click to dial" <'.$destination.'>';
	}
}
?>
