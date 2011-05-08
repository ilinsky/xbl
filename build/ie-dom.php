<?
	$aFiles		= array();

	// IE DOM
	$aFiles[]	= "../source/dom-ie/ie.js";
	$aFiles[]	= "../source/dom-ie/classes/DocumentEvent.js";
	$aFiles[]	= "../source/dom-ie/classes/EventTarget.js";

	$sOutput	= "";
	for ($nIndex = 0; $nIndex < count($aFiles); $nIndex++)
		$sOutput	.= join('', file($aFiles[$nIndex])) . "\n";

	if (true) {
		include("obfuscator/cJSObfuscator.php");

		$oJSObfuscator	= new cJSObfuscator;
//		$oJSObfuscator->debug	= true;
		$oJSObfuscator->keyword	= "munged";
		$oJSObfuscator->readFromString($sOutput);

		//
		$oJSObfuscator->addOmmitArray(array(	"http://www.w3.org/ns/xbl",
												"http://www.w3.org/XML/1998/namespace"));

		$oJSObfuscator->addOmmitArray(array(	"Microsoft.XMLHTTP",
												"Microsoft.XMLDOM"));

		//
		$sOutput	= fStripTags($sOutput, "Source");
		$sOutput	= fStripTags($sOutput, "Debug");

		//
		$oJSObfuscator->stripComments();
		$oJSObfuscator->stripSpaces();
		$oJSObfuscator->stripLineFeeds();

		$oJSObfuscator->obfuscateStrings();
		$oJSObfuscator->obfuscateVariables();
		$oJSObfuscator->obfuscatePrivates();
		$oJSObfuscator->obfuscate();

		$sOutput	= $oJSObfuscator->getOutput();
	}
	else {
		// Add function names
//		$sOutput = preg_replace("/([a-z0-9\$_]+)(\.)" . "(prototype)?(\.)?" . "([a-z0-9\$_]+)" . "[ \t]*=[ \t]*function[ \t]*\(/i", "$1$2$3$4$5=function $1_$3_$5(", $sOutput);

		$sOutput	= 	"".
						"(function () {\n" .
							$sOutput .
						"\n})()" .
						"";
	}

	header("Content-Type: application/x-javascript");

	echo $sOutput;
?>