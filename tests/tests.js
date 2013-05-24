(function(LocalDB, localStorage, testing) {
	'use strict';

	var prepare = function() {
		localStorage.clear();
		return new LocalDB('test');
	};

	testing.module('Initialization Tests');
	testing.test('Fail on creation instance without a name', function() {
		testing.throws(function() {
			new LocalDB('');
		}, 'Passed!');
	});

	testing.test('Properly create new DB', function() {
		var testdb = prepare();
		var instanceString = localStorage.getItem('test_localdb_instance');
		testing.ok(instanceString !== null, 'localStorage allocated.');

		var defaultInstance = {
			metadata: {
				active: null
			},
			entries: []
		};
		testing.deepEqual(JSON.parse(instanceString), defaultInstance, 'Contains proper structure.');

		testing.ok(testdb.count() === 0, 'Entry count is correct at 0.');
		testing.ok(testdb.getActive() === null, 'Current active entry is null.');
		testing.deepEqual(testdb.entries, [], 'Current entries are an empty list.');
	});

	testing.test('Load db with existing entries', function() {
		var initdb = prepare();
		var id = initdb.addItem({
			hello: 'world!'
		});

		var testdb = new LocalDB('test');
		testing.strictEqual(testdb.count(), 1, 'Number of entries is as planned at 1.');
		testing.notStrictEqual(testdb.getItem(id), null, 'Existing item is still available within existing db.');
	});

	testing.module('Entry Addition Tests');
	testing.test('Entry has been properly added', function() {
		var testdb = prepare();
		var testItem = {
			hello: 'world!'
		};
		var id = testdb.addItem(testItem);

		var storage = JSON.parse(localStorage.getItem(testdb.instanceName));
		var storedItem = {};
		for (var i in storage.entries) {
			if (storage.entries[i].$id === id) {
				storedItem = storage.entries[i];
				break;
			}
		}
		testing.deepEqual(storedItem, testItem, 'addItem properly stores added item in localstorage.');
		testing.deepEqual(testdb.getItem(id), testItem, 'getItem properly retrieves saved item.');
	});

	testing.module('Entry Deletion Tests');
	testing.test('Entry is cleanly deleted',function() {
		var testdb = prepare();
		var testItem = {
			hello: 'world!'
		};
		var id = testdb.addItem(testItem);
		testdb.removeItem(id);

		testing.strictEqual(testdb.count(), 0, 'The count of entries is propert at 0.');
		testing.strictEqual(testdb.getItem(id), null, 'The item is no longer available via getItem.');

		var hasItem = false;
		var storage = JSON.parse(localStorage.getItem(testdb.instanceName));
		for (var i in storage.entries) {
			if (storage.entries[i].$id === id) {
				hasItem = true;
				break;
			}
		}
		testing.strictEqual(hasItem, false, 'The item is no longer stored in the localStorage.');
	});

	testing.module('Subscriber Notifications Tests');
	testing.test('Check notifications for subscribers', function() {
		testing.expect(3);
		var testdb = prepare();
		testing.throws(function() {
			testdb.subscribe('foo');
		}, 'Adding improper subscribers fails');

		var onnotify = function() {
			testing.ok(true, 'Notification of change to entries.');
		};
		testdb.subscribe(onnotify);
		var id = testdb.addItem({
			foo: 'bar'
		});
		testdb.getItem(id);
		testdb.removeItem(id);
	});

}(window.LocalDB, window.localStorage, {
	ok: window.ok,
	test: window.test,
	deepEqual: window.deepEqual,
	strictEqual: window.strictEqual,
	notStrictEqual: window.notStrictEqual,
	expect: window.expect,
	module: window.module,
	'throws': window.throws
}));