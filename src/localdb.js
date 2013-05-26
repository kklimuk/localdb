(function(localStorage) {
	'use strict';

	var defaultInstance = JSON.stringify({
		metadata: {
			active: null
		},
		entries: []
	});

	var defaultPreprocessor = function(item, id) {
		item.$id = id;
		return item;
	};

	var load = function() {
		var instanceString = localStorage.getItem(this.instanceName);
		if (instanceString === null) {
			instanceString = defaultInstance;
			localStorage.setItem(this.instanceName, defaultInstance);
		}

		var instance = JSON.parse(instanceString);
		this.metadata = instance.metadata;
		for (var i in instance.entries) {
			__addItem.call(this, instance.entries[i]);
		}
	};

	function generateId() {
		return (new Date().getTime() + Math.floor(Math.random() * 1e13)).toString(16);
	}

	function toJSON() {
		return JSON.stringify({
			metadata: this.metadata,
			entries: this.entries
		});
	}

	function __getItem(id)  {
		var item = this.entriesHash[id];
		if (typeof this.entriesHash[id] === 'undefined') {
			return null;
		} else {
			return item;
		}
	}

	function __addItem(item) {
		var id = generateId.call(this);
		if (typeof item.$id !== 'undefined') {
			id = item.$id;
			delete item.$id;
		}

		item = this.preprocessor(item, id);
		this.entriesHash[id] = item;
		this.entries.push(item);

		return id;
	}

	function __removeItem(id) {
		if (typeof this.entriesHash[id] === 'undefined') {
			return false;
		}
		delete this.entriesHash[id];

		var entries = this.entries;
		for (var index in entries) {
			if (entries[index].$id === id) {
				entries.splice(index, 1);
				break;
			}
		}
		return true;
	}

	function __process(fun, notify) {
		if (typeof fun === 'function') {
			var self = this;
			return function(arg) {
				var toReturn = fun.call(self, arg);
				localStorage.setItem(self.instanceName, toJSON.call(self));
				if (notify !== false) {
					self.notify.call(self);
				}
				return toReturn;
			};
		}
	}

	function LocalDB(name, preprocessor) {
		if (!name) {
			throw 'No db name provided';
		} else {
			this.instanceName = name + '_localdb_instance';
		}

		if (typeof preprocessor !== 'function') {
			this.preprocessor = defaultPreprocessor;
		} else {
			this.preprocessor = preprocessor;
		}

		this.metadata = {};
		this.entries = [];
		this.entriesHash = {};
		this.subscribers = [];

		this.getItem = __process.call(this, __getItem, false);
		this.addItem = __process.call(this, __addItem);
		this.removeItem = __process.call(this, __removeItem);

		load.call(this);
	}

	LocalDB.prototype.count = function() {
		return this.entries.length;
	};

	LocalDB.prototype.save = function() {
		localStorage.setItem(this.instanceName, toJSON.call(this));
	};

	LocalDB.prototype.getActive = function() {
		return this.metadata.active;
	};

	LocalDB.prototype.notify = function() {
		for (var i = this.subscribers.length - 1; i >= 0; i--) {
			this.subscribers[i](this.entries);
		}
	};

	LocalDB.prototype.subscribe = function(subscriber) {
		if (typeof subscriber !== 'function') {
			throw 'Subscriber must be a function.';
		}
		this.subscribers.push(subscriber);
	};

	window.LocalDB = LocalDB;
}(window.localStorage));