var cMutationEvent	= new window.Function;
cMutationEvent.prototype	= new cEvent;

// Constants
cMutationEvent.MODIFICATION	= 1;
cMutationEvent.ADDITION		= 2;
cMutationEvent.REMOVAL		= 3;

// Public Properties
cMutationEvent.prototype.relatedNode= null;
cMutationEvent.prototype.prevValue	= null;
cMutationEvent.prototype.newValue	= null;
cMutationEvent.prototype.attrName	= null;
cMutationEvent.prototype.attrChange	= null;

// Public Methods
cMutationEvent.prototype.initMutationEvent	= function(sType, bCanBubble, bCancelable, oRelatedNode, sPrevValue, sNewValue, sAttrName, nAttrChange) {
	this.initEvent(sType, bCanBubble, bCancelable);

	//
	this.relatedNode	= oRelatedNode;
	this.prevValue		= sPrevValue;
	this.newValue		= sNewValue;
	this.attrName		= sAttrName;
	this.attrChange		= nAttrChange;
};

cMutationEvent.prototype.initMutationEventNS	= function(sNameSpaceURI, sType, bCanBubble, bCancelable, oRelatedNode, sPrevValue, sNewValue, sAttrName, nAttrChange) {
	this.initMutationEvent(sType, bCanBubble, bCancelable, oRelatedNode, sPrevValue, sNewValue, sAttrName, nAttrChange);

	//
	this.namespaceURI	= sNameSpaceURI;
};