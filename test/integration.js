const should = require('should');
const tools = require('../src/tools');
const http = require('http');

const url = "http://localhost:3001/api";
const shouldLog = true;
const log = tools.logGenerator(() => shouldLog, "test");

const applyOnError = (req) => {
    req.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        throw e;
    });
};

const simpleGetTest = (urlSuffix) => function (done) {
    log("Initiating get request");
    const req = http.get(url + urlSuffix, function (response) {
        log("Received get response for " + urlSuffix, response.statusCode);
        response.statusCode.should.eql(200);
        done();
    });
    applyOnError(req);
};

const getAndPutTest = (suffix) => function (done) {
    const req = http.get(url + suffix, function (response) {
        log("Received response", response);
        response.statusCode.should.eql(200);
        response.on('data', function (chunk) {
            log("Received old data", chunk);
            const oldData = chunk;
            putTest(suffix, oldData, done);
        });
    });
    applyOnError(req);
};

const putTest = (suffix, payload, done) => {
    const options = { method: "PUT", headers: { "Content-Type": "application/json" }, path: "/api" + suffix, port: 3001, host: "localhost", protocol: "http:" };
    log("Initiating put request for ", options);
    let req = http.request(options, function (response) {
        if (response.statusCode != 200) {
            "".should.eql("ERROR on PUT " + suffix + "! status code " + response.statusCode + ": " + response.statusMessage);
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
    applyOnError(req);
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
    it('should put reload library ok', function (done) {
        putTest("/library", null, done);
    });
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
    it('should start/stop music', function (done) {
        putTest("/music-stop", null, () => { putTest("/music-start", null, done) });
    });
});