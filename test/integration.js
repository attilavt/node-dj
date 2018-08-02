const should = require('should');
const request = require('request');
const shell = require('shelljs');
const url = "http://localhost:3001/api";
const tools = require('../src/tools');
const http = require('http');
const shouldLog = true;
const log = tools.logGenerator(() => shouldLog, "test");

const simpleGetTest = (urlSuffix) => function (done) {
    log("Initiating get request");
    request(url + urlSuffix, function (error, response, body) {
        log("Received get response for " + urlSuffix, response.statusCode);
        response.statusCode.should.eql(200);
        done();
    });
};

const getAndPutTest = (suffix) => function (done) {
    request(url + suffix, function (error, response, body) {
        if (error) {
            throw error;
        }
        log("Received old data");
        response.statusCode.should.eql(200);
        const oldData = body;
        putTest(suffix, oldData, done);
    });
};

const putTest = (suffix, payload, done) => {
    const options = { method: "PUT", headers: { "Content-Type": "application/json" }, path: "/api" + suffix, port: 3001, host: "localhost", protocol: "http:" };
    log("Initiating put request for ", options);
    let req = http.request(options, function (response) {
        if (response.statusCode != 200) {
            "Error".should.eql("ERROR! status code " + response.statusCode + ":" + response.statusMessage);
        }
        log("Received put response for /api" + suffix, response);
        done();
    });
    if (payload) {
        const body = JSON.stringify(payload);
        log("Writing data into put request:", body);
        const res = req.write(payload);
        console.log("res", res);
    }
    req.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });
    req.end();
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
    it('should get library stats ok', simpleGetTest("/library-stats"));
    it('should get songs ok', simpleGetTest("/songs"));
    it('should get current song ok', simpleGetTest("/current-song"));
    it('should get IP addresses ok', simpleGetTest("/ip-addresses"));
    it('should get next song ok', simpleGetTest("/next-song"));

    it('should put skip track ok', function (done) {
        putTest("/skip-track", null, done);
    });
    it('should put skip album ok', function (done) {
        putTest("/skip-album", null, done);
    });
});