<?
	include("cJSObfuscator.php");

	$sInputFile		= $_SERVER["argv"][1];
	$sOutputFile	= $_SERVER["argv"][2];

	$sInput		= join('', file($sInputFile));
	$sOutput	= $sInput;

	echo "Reading: " . $sInputFile . "\n";

	// Strip "Source" version tags
	if (in_array("--strip-Source", $_SERVER["argv"])) {
		echo "Stripping 'Source' code\n";
		$sOutput	= fStripTags($sOutput, "Source");
	}
	// Strip "Debug" version tags
	if (in_array("--strip-Debug", $_SERVER["argv"])) {
		echo "Stripping 'Debug' code\n";
		$sOutput	= fStripTags($sOutput, "Debug");
	}

	if (in_array("--obfuscate", $_SERVER["argv"])) {

		$oJSObfuscator	= new cJSObfuscator;
		$oJSObfuscator->keyword	= "munged";
		$oJSObfuscator->readFromString($sOutput);

		//
		$oJSObfuscator->addOmmitArray(array(	"http://www.w3.org/ns/xbl",
												"http://www.w3.org/XML/1998/namespace"));

		$oJSObfuscator->addOmmitArray(array(	"Microsoft.XMLHTTP",
												"Microsoft.XMLDOM"));

		echo "Obfuscating contents\n";

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
		echo "Wrapping contents\n";

		$sOutput	= 	"".
						"(function () {\n" .
							$sOutput . "\n" .
						"})()" .
						"";
	}

	echo "Writing: " . $sOutputFile ."\n";

	$fOutpuFile	= fopen($sOutputFile, "w+");
	fwrite($fOutpuFile, $sOutput);
	fclose($fOutpuFile);
?>