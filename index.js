'use strict';
var crypto = require('crypto');
var util = require('util');

var request = require('request');

function UpYunAV(bucket_name, operator_name, password) {
    this._bucket_name = bucket_name;
    this._operator_name = operator_name;
    this._password = crypto.createHash('md5').update(password).digest('hex');
}


UpYunAV.prototype.pretreatment = function(source, params, callback) {
    params.source = source;
    this._doRequest('/pretreatment/', 'POST', params, callback);
};


UpYunAV.prototype._doRequest = function(path, method, params, callback) {
    var autheader = util.format('UPYUN %s:%s', this._operator_name, this._makeSign(params));
    function doit() {
        request({
            url: 'http://p0.api.upyun.com' + path,
            method: method,
            headers: {
                'Authorization': autheader
            },
            form: params
        }, function(err, res, body) {
            callback(err, body);
        });
    }

    doit();
};


UpYunAV.prototype._makeSign = function(params) {
    var policy_string = Object.keys(params).sort().map(function(key) {
        if (key === 'signature') {
            return '';
        }
        return key + params[key];
    }).join('');

    policy_string = util.format(
        '%s%s%s',
        this._operator_name,
        policy_string, this._password);
    return crypto.createHash('md5').update(policy_string).digest('hex');
};



module.exports = UpYunAV;