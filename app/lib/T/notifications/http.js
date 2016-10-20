/**
 * @module  notifications/http
 * @author  Flavio De Stefano <flavio.destefano@caffeinalab.com>
 */

/**
 * @property config
 * @property {String} config.subscribeEndpoint		URL for subscription
 * @property {String} config.unsubscribeEndpoint	URL for unsubscription
 */
exports.config = _.extend({
	subscribeEndpoint: '/notifications/subscribe',
	unsubscribeEndpoint: '/notifications/unsubscribe'
}, (Alloy.CFG.T && Alloy.CFG.T.notifications) ? Alloy.CFG.T.notifications.http : {});

var HTTP = require('T/http');
var Util = require('T/util');

var deploy_type = (Ti.App.deployType === 'production' ? 'production' : 'development');

exports.subscribe = function(opt) {
	if (exports.config.subscribeEndpoint == null) {
		throw new Error("Notifications.HTTP: Invalid HTTP endpoint");
	}

	HTTP.send({
		url: exports.config.subscribeEndpoint,
		method: 'POST',
		data: _.extend({}, opt.data, {
			device_token: opt.deviceToken,
			channel: opt.channel,
			app_id: Ti.App.id,
			app_version: Ti.App.version,
			app_deploytype: Util.getDeployType(),
			os: Util.getOS(),
		}),
		success: opt.success,
		error: opt.error,
		suppressFilters: opt.suppressFilters,
		errorAlert: false,
		silent: true
	});
};

exports.unsubscribe = function(opt) {
	if (exports.config.unsubscribeEndpoint == null) {
		throw new Error("Notifications.HTTP: Invalid HTTP endpoint");
	}

	HTTP.send({
		url: exports.config.unsubscribeEndpoint + '/' + opt.deviceToken,
		method: 'POST',
		data: _.extend({}, opt.data, {
			channel: opt.channel,
		}),
		success: opt.success,
		error: opt.error,
		suppressFilters: opt.suppressFilters,
		errorAlert: false,
		silent: true
	});
};