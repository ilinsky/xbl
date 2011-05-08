function cDocumentEvent() {
	// Disallow object instantiation
	throw 9;
};

cDocumentEvent.prototype.createEvent	= function(sEventType) {
/*
	switch (sEventType.replace(/s$/, '')) {
		case "Event":	return new cEvent;
	};
*/
	return document.createEventObject(sEventType);
};

cDocumentEvent.prototype.canDispatch	= function(sNameSpaceURI, sType) {
	throw "Not implemented";
};