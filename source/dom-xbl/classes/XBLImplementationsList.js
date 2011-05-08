var cXBLImplementationsList	= new window.Function;

// Public Properties
cXBLImplementationsList.prototype.length	= 0;

// Public Methods
cXBLImplementationsList.prototype.item	= function(nIndex) {
	if (typeof nIndex == "number" && nIndex <= this.length)
		return this[nIndex];
	else
		throw 1;	// INDEX_SIZE_ERR
};