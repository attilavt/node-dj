const fs = require('fs');
const date = function () {
    const res = new Date().toISOString().replace(":", "_").replace(":", "_");
    console.log("logfile name", res);
    return res;
};
const logFileName = `log/log-${date()}.txt`;
fs.writeFileSync(logFileName, "");
let fullLog = "";
let logToWrite = [];

setInterval(() => {
    for (let line of logToWrite) {
        fullLog += line + "\n";
    }
    logToWrite = [];
    fs.writeFile(logFileName, fullLog, (err) => {
        if (err) {
            console.error("error when writing to log", err);
        }
    });
}, 3000);

const safeStringify = function (obj) {
    try {
        return JSON.stringify(obj);
    } catch (err) {
        console.log("Catching1");
        let firstLevel = true;
        const replacer = function (key, value) {
            if (typeof value === "object" && firstLevel) {
                firstLevel = false;
                return value;
            }
            if (typeof value === "object" && !firstLevel) {
                return "an object";
            }
            return value;
        }
        return JSON.stringify(obj, replacer);

    }
};

const logSomeWhere = function (prefix, args) {
    let toLog = "[" + prefix + "] ";
    for (let arg of args) {
        if (typeof arg === "object") {
            toLog += safeStringify(arg) + " ";
        } else {
            toLog += arg + " ";
        }
    }
    toLog = `${new Date().toISOString()} ${toLog}`;
    console.log(toLog);
    logToWrite.push(toLog);
};

const log = function () {
    logSomeWhere("tools", arguments);
};
/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
const shuffle = function (a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

module.exports = {
    logGenerator: function (flagCallback, prefix) {
        return function () {
            if (flagCallback()) {
                logSomeWhere(prefix, arguments);
            }
        };
    },
    readFile: function (data, fieldName, callback, throwIfError) {
        log("Starting reading file", fieldName);
        fs.readFile('data/' + fieldName + '.json', function (err, readData) {
            log("Done reading file", fieldName);
            if (err) {
                const msg = "Error when reading file " + fieldName + ":" + safeStringify(err);
                if (throwIfError) {
                    throw msg;
                } else {
                    console.error(msg);
                }
            } else {
                try {
                    data[fieldName] = JSON.parse(readData);
                    callback();
                } catch (err2) {
                    const msg2 = "Error when parsing file " + fieldName + ":" + safeStringify(err2);
                    if (throwIfError) {
                        throw msg2;
                    } else {
                        console.error(msg2);
                    }
                }
            }
        });
    },
    writeFile: function (fileName, data) {
        fs.writeFile(fileName, data, function (err) {
            if (err) {
                log("error when writing file!", fileName, err);
            }
        });
    },
    shuffle: shuffle,

    getHour: function () {
        return new Date().getHours();
        //return Math.floor(Math.random() * 24);
    },

    isBetweenHours: function (theHour, windowStartHour, windowEndHour) {
        if (theHour === windowStartHour) {
            return true;
        }
        if (theHour < windowStartHour) {
            return theHour < windowEndHour;
        }
        return windowStartHour <= theHour && theHour < windowEndHour;
    },

    safeStringify: safeStringify,
}