const should = require('should');
const request = require('request');
const shell = require('shelljs');
const url = "http://localhost:3001/api";
const tools = require('../src/tools');
const shouldLog = false;
const log = tools.logGenerator(() => shouldLog, "test");

const simpleGetTest = (urlSuffix) => function (done) {
    log("Initiating get request");
    request(url + urlSuffix, function (error, response, body) {
        log("Received get response for " + urlSuffix);
        response.statusCode.should.eql(200);
        done();
    });
};

const getAndPutTest = (suffix) => function (done) {
    request(url + suffix, function (error, response, body) {
        log("Received old data");
        response.statusCode.should.eql(200);
        const oldData = body;
        putTest(url + suffix, oldData, done);
    });
};

const putTest = (theUrl, payload, done) => {
    log("Initiating put request");
    request(theUrl, function (error, response, body) {
        log("Received put response for " + theUrl, response.statusCode);
        response.statusCode.should.eql(200);
        done();
    }, payload);
};

describe('HttpServer', function () {

    before(function (done) {
        log("Preparation done!");
        done();
    });

    after(function (done) {
        log("Integration test done!");
        done();
    });

    it('should get health ok', simpleGetTest("/health"));


    it('should get times ok', simpleGetTest("/times"));

    it('should put times ok', getAndPutTest("/times"));

    it('should get hour ok', simpleGetTest("/hour"));
    it('should get genre names ok', simpleGetTest("/genre-names"));
    it('should get genre name ok', simpleGetTest("/genre-name"));
    it('should get library ok', simpleGetTest("/library"));
});