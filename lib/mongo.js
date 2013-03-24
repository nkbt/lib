'use strict';

var mongodb = require("mongodb");

var mongoServer = new mongodb.Server('localhost', mongodb.Connection.DEFAULT_PORT, {auto_reconnect: true, w: 1, journal: true});
var dbConnector = new mongodb.Db('nkbt', mongoServer, {logger: console});


/**
 * @type {MongoClient}
 */
var db;

var isConnecting = false;
var deferred = [];

/**
 * @param {Function} callback
 */
module.exports = function (callback) {
	if (db) {
		callback(null, db);
	} else {
		if (isConnecting) {
			deferred.push(callback);
		} else {
			isConnecting = true;
			dbConnector.open(function (error, dbInstance) {
				db = dbInstance;
				callback(error, db);
				deferred.forEach(function (item) {
					item(error, db);
				});
				deferred = [];
				isConnecting = false;
			});
		}
	}
};
