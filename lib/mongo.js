'use strict';

var mongodb = require("mongodb");

var mongoServer = new mongodb.Server('localhost', mongodb.Connection.DEFAULT_PORT, {auto_reconnect: true});


/**
 * @type {MongoClient}
 */
var mongoClient;

var isConnecting = false;
var deferred = [];

/**
 * @param {Function} callback
 */
var client = function (database, callback) {
	if (mongoClient) {
		return callback(null, mongoClient);
	}

	if (isConnecting) {
		return deferred.push(callback);
	}

	isConnecting = true;
	var dbConnector = new mongodb.Db(database, mongoServer, {logger: console, safe: true});
	return dbConnector.open(function (error, dbInstance) {
		mongoClient = dbInstance;
		callback(error, mongoClient);
		deferred.forEach(function (item) {
			item(error, mongoClient);
		});
		deferred = [];
		isConnecting = false;
	});
};

var collection = function (database, collection, callback) {
	return client(database, function (error, db) {
		if (error) {
			return callback(error);
		}
		return db.collection(collection, callback);
	});
};

exports.database = client;
exports.collection = collection;