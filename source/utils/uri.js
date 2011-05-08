// TODO: Implement caching
function fGetUriComponents(sUri) {
	var aResult = sUri.match(/^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?/),
		oResult	= {};

	oResult._scheme		= aResult[2];	// scheme
	oResult._authority	= aResult[4];	// authority
	oResult._path		= aResult[5];	// path
	oResult._query		= aResult[7];	// query
	oResult._fragment	= aResult[9];	// fragment

	return oResult;
};

/*
 * Resolves Uri to a BaseUri
 */
function fResolveUri(sUri, sBaseUri) {
	if (sUri == '' || sUri.charAt(0) == '#')
		return sBaseUri;

	var oUri = fGetUriComponents(sUri);
	if (oUri._scheme)
		return sUri;

	var oBaseUri = fGetUriComponents(sBaseUri);
	oUri._scheme = oBaseUri._scheme;

	if (!oUri._authority)
	{
		oUri._authority = oBaseUri._authority;
		if (oUri._path.charAt(0) != '/')
		{
			var aUriSegments = oUri._path.split('/'),
				aBaseUriSegments = oBaseUri._path.split('/');
			aBaseUriSegments.pop();
			var nBaseUriStart = aBaseUriSegments[0] == '' ? 1 : 0;
			for (var i = 0, nLength = aUriSegments.length; i < nLength; i++)
			{
				if (aUriSegments[i] == '..')
				{
					if (aBaseUriSegments.length > nBaseUriStart)
						aBaseUriSegments.pop();
					else
					{
						aBaseUriSegments.push(aUriSegments[i]);
						nBaseUriStart++;
					}
				}
				else
				if (aUriSegments[i] != '.')
					aBaseUriSegments.push(aUriSegments[i]);
			}
			if (aUriSegments[--i] == '..' || aUriSegments[i] == '.')
				aBaseUriSegments.push('');
			oUri._path = aBaseUriSegments.join('/');
		}
	}

	var aResult = [];
	if (oUri._scheme)
		aResult.push(oUri._scheme + ':');
	if (oUri._authority)
		aResult.push('/' + '/' + oUri._authority);
	if (oUri._path)
		aResult.push(oUri._path);
	if (oUri._query)
		aResult.push('?' + oUri._query);
	if (oUri._fragment)
		aResult.push('#' + oUri._fragment);

	return aResult.join('');
};

/*
 * Checks if the sUri and sBaseUri are coming from the same domain
 */
function fUrisInSameDomain(sUri, sBaseUri) {
	var oUri = fGetUriComponents(sUri),
		oBaseUri = fGetUriComponents(sBaseUri);
	return !oUri._scheme || !oBaseUri._scheme ||(oUri._authority == oBaseUri._authority && oUri._scheme == oBaseUri._scheme);
};

/*
 * Resolves baseUri property for a DOMNode
 */
function fGetXmlBase(oNode, sDocumentUri) {
	if (oNode.nodeType == 9)
		return sDocumentUri;

	if (oNode.nodeType == 1) {
		var sXmlBase	= oNode.getAttribute("xml" + ':' + "base");
		if (!sXmlBase && oNode.getAttributeNS)	// Opera, Safari but not FF
			sXmlBase	= oNode.getAttributeNS("http://www.w3.org/XML/1998/namespace", "base");

		if (sXmlBase)
			return fResolveUri(sXmlBase, fGetXmlBase(oNode.parentNode, sDocumentUri));
	}
	return fGetXmlBase(oNode.parentNode, sDocumentUri);
};