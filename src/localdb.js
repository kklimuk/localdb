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
			this.__addItem(instance.entries[i]);
		}
	};

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

		this.getItem = this.__process(this.__getItem, false);
		this.addItem = this.__process(this.__addItem);
		this.removeItem = this.__process(this.__removeItem);

		load.call(this);
	}

	LocalDB.prototype.count = function() {
		return this.entries.length;
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

	LocalDB.prototype.__getItem = function(id) {
		var item = this.entriesHash[id];
		if (typeof this.entriesHash[id] === 'undefined') {
			return null;
		} else {
			return item;
		}
	};

	LocalDB.prototype.__addItem = function(item) {
		var id = this.generateId();
		if (typeof item.$id !== 'undefined') {
			id = item.$id;
			delete item.$id;
		}

		item = this.preprocessor(item, id);
		this.entriesHash[id] = item;
		this.entries.push(item);

		return id;
	};

	LocalDB.prototype.__removeItem = function(id) {
		if (typeof this.entriesHash[id] === 'undefined') {
			return false;
		}

		delete this.entriesHash[id];
		for (var index in this.entries) {
			if (this.entries[index].$id === id) {
				this.entries.splice(index, 1);
				break;
			}
		}
		return true;
	};

	LocalDB.prototype.__process = function(fun, notify) {
		if (typeof fun === 'function') {
			var self = this;
			return function(arg) {
				var toReturn = fun.call(self, arg);
				localStorage.setItem(self.instanceName, self.toJSON());
				if (notify !== false) {
					self.notify.call(self);
				}
				return toReturn;
			};
		}
	};

	LocalDB.prototype.generateId = function() {
		return (new Date().getTime() + Math.floor(Math.random() * 1e13)).toString(16);
	};

	LocalDB.prototype.toJSON = function() {
		return JSON.stringify({
			metadata: this.metadata,
			entries: this.entries
		});
	};

	window.LocalDB = LocalDB;
}(window.localStorage));