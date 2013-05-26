# LocalDB
A way to create named, persistent collections using the browser's localStorage key-value store (with subscriptions to their modifications!). I personally use this in mobile web or Apache Cordova (PhoneGap) apps to persist information.

## Getting Started
Clone this repository and include localdb.js in your project's libraries.

## Documentation
### Creating a new LocalDB collection

	var db = new LocalDB(name, preprocessor);

The name describes the collection and is used to retrieve it.

The preprocessor is used on every stored element in the collection to transform it from a regular JS object into the type of object you'd like it to be. A standard preprocessor can look something like this:

	var defaultPreprocessor = function(item, id) {
		return new BetterItem(item, id);
	}

The preprocessor is called when the items are originally retrieved from localStorage or are added to the collection.
The collection also creates internal ids to identify items which are used to retrieve items.

### Adding items to the collection
	db.addItem({
		"hello": "world!"
	});
	// => generated id

### Removing items from the collection
	db.removeItem(id);
	// => true on success, false on failure

### Getting items from the collection
	db.getItem(id);
	// => item on success, null on failure

### Subscribing to collection changes
	db.subscribe(function(entries) {
		// do something with entries
	});

The collection publishes changes when ```addItem``` or ```removeItem``` are called.

### Saving the collection to localStorage
	db.save();

## Coming Soon
* Metadata about which entry is currently active. Useful for items like users one of which is active at a time.
* Getting items by anything except their ids.
* Adding functional methods to dbs: ```filter```, ```forEach```, ```reduce```, ```map```, etc.

## Contributing
Ask me to become a core contributor to the project or send in your pull requests.

## Release History
* 2013 May 25 - v0.1.1 - Adding saving of the collection at any time and making some member functions private.
* 2013 May 24 - v0.1.0 - Implements adding, removing, and getting entries into the named collections. Also adds pub/sub functionality to the mix.

## License
Copyright (c) 2013 Kirill Klimuk
Licensed under the MIT license.