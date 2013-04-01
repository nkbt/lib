'use strict';

var fs = require('fs');
var path = require('path');
var async = require('async');
var mime = require('mime');
var crypto = require('crypto');
var mkdirp = require('mkdirp');

var generateFileName = function (seed, ext) {
	return crypto.createHash('sha1')
		.update(seed)
		.update((new Date()).toJSON())
		.digest('hex') + '.' + ext;
};

var saveUploadedFile = function (saveDir, file, callback) {
	var savePath;

	savePath = path.join(
		saveDir,
		generateFileName(
			path.basename(file.path),
			mime.extension(file.type)
		)
	);

	async.series(
		[
			async.apply(mkdirp, saveDir),
			async.apply(fs.rename, file.path, savePath)
		],
		function (error) {
			callback(error, savePath);
		}
	);
};


var saveUploadedFiles = function (files, saveDir, callback) {

	async.parallel(
		files.map(function (file) {
			return async.apply(saveUploadedFile, saveDir, file);
		}),
		callback
	);
};


exports.saveUploadedFiles = saveUploadedFiles;