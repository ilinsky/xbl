<?
	$aFiles		= array();
	//
	$aFiles[]	= "../source/utils/uri.js";

	// Events
	$aFiles[]	= "../source/dom-events/classes/Event.js";
	$aFiles[]	= "../source/dom-events/classes/UIEvent.js";
	$aFiles[]	= "../source/dom-events/classes/MouseEvent.js";
	$aFiles[]	= "../source/dom-events/classes/MouseWheelEvent.js";
	$aFiles[]	= "../source/dom-events/classes/KeyboardEvent.js";
	$aFiles[]	= "../source/dom-events/classes/TextEvent.js";
	$aFiles[]	= "../source/dom-events/classes/MutationEvent.js";
	$aFiles[]	= "../source/dom-events/classes/CustomEvent.js";

	// Selectors
	$aFiles[]	= "../source/dom-selectors/DocumentSelector.js";
	$aFiles[]	= "../source/dom-selectors/ElementSelector.js";

	$aFiles[]	= "../source/css-selectors/parser.js";
	$aFiles[]	= "../source/css-selectors/resolver.js";
	$aFiles[]	= "../source/css-selectors/selectors/element.js";
	$aFiles[]	= "../source/css-selectors/selectors/attribute.js";
	$aFiles[]	= "../source/css-selectors/selectors/pseudo.js";

	// XBL
	$aFiles[]	= "../source/dom-xbl/classes/XBLImplementation.js";
	$aFiles[]	= "../source/dom-xbl/classes/XBLImplementationsList.js";
	//
	$aFiles[]	= "../source/dom-xbl/ElementXBL.js";
	$aFiles[]	= "../source/dom-xbl/DocumentXBL.js";
	//
	$aFiles[]	= "../source/xbl/processor.js";
	$aFiles[]	= "../source/xbl/router.js";
	$aFiles[]	= "../source/xbl.js";

	$sOutput	= "";
	for ($nIndex = 0; $nIndex < count($aFiles); $nIndex++)
		$sOutput	.= join('', file($aFiles[$nIndex])) . "\n";

	if (false) {
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