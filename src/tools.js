const fs = require('fs');
const os = require('os');

const date = function () {
    const res = new Date().toISOString().replace(":", "_").replace(":", "_");
    console.log("logfile name", res);
    return res;
};
const logFileName = `log/log-${date()}.txt`;
fs.writeFileSync(logFileName, "");
let fullLog = "";
let logToWrite = [];
let logFileNames = [];

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

fs.readdir('./log/', (err, files) => {
    files.forEach(file => {
        logFileNames.push(file);
    });
    log("Done reading log file names.");
})

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

const padToLength = function (aNumber, length) {
    let result = "" + aNumber;
    while (result.length < length) {
        result = "0" + result;
    }
    return result;
}

const getUtcOffset = function () {
    const rawOffsetMinutes = -1 * (new Date().getTimezoneOffset());
    const hours = Math.floor(rawOffsetMinutes / 60);
    const hoursString = (hours < 10 ? "0" : "") + hours;
    const minutes = rawOffsetMinutes % 60;
    const minutesString = (minutes < 10 ? "0" : "") + minutes;
    return "UTC" + (rawOffsetMinutes >= 0 ? "+" : "") + hoursString + ":" + minutesString;
};

/**
 * 
 * @param {number} n The number to pad 
 * @param {number} l The desired length of the result
 * @returns {string} A padded string representing the number 
 */
const padTo = (n, l) => {
    let result = "" + n;
    while (result.length < l) {
        result = 0 + result;
    }
    return result;
};

module.exports = {
    logGenerator: function (flagCallback, prefix) {
        return function () {
            if (flagCallback()) {
                logSomeWhere(prefix, arguments);
            }
        };
    },
    readFile: function (data, fieldName, fileName, callback, throwIfError) {
        log("Starting reading file", fileName);
        fs.readFile(fileName, function (err, readData) {
            log("Done reading file", fileName);
            if (err) {
                const msg = "Error when reading file " + fileName + ":" + safeStringify(err);
                if (throwIfError) {
                    throw msg;
                } else {
                    log("ERROR!", msg);
                }
            } else {
                try {
                    data[fieldName] = JSON.parse(readData);
                } catch (err2) {
                    const msg2 = "Error when parsing file " + fileName + ":" + safeStringify(err2);
                    if (throwIfError) {
                        throw msg2;
                    } else {
                        log("ERROR!!", msg2);
                    }
                }
            }
            callback();
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

    /**
     * @param {number} theHour The hour for which to find out whether it is inside an hour window
     * @param {number} windowStartHour The start hour of the window
     * @param {number} windowEndHour The end hour of the window
     * @returns {boolean} whether given hour is within given time frame
     */
    isBetweenHours: (theHour, windowStartHour, windowEndHour) => {
        if (theHour === windowStartHour) {
            return true;
        }
        if (windowEndHour < windowStartHour) {
            return theHour < windowEndHour || theHour > windowStartHour;
        }
        return windowStartHour <= theHour && theHour < windowEndHour;
    },

    safeStringify: safeStringify,

    /**
     * @param {number} millis a duration in milliseconds to be converted to a human-readable string
     * @returns {string} a human-readable representation in the format (mm:ss)
     */
    msToTime: (millis) => {
        const seconds = Math.round(millis / 1000);
        const minutes = Math.round(seconds / 60);
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            return hours + ":" + padToLength(minutes % 60, 2) + ":" + padToLength(seconds % 60, 2);
        }
        return minutes + ":" + padToLength(seconds % 60, 2);
    },

    getUtcOffset: getUtcOffset,

    /**
     * @returns {object} an object with device names as keys and addresses as values
     */
    getIpAddresses: function () {
        const ifaces = os.networkInterfaces();
        let result = {};

        Object.keys(ifaces).forEach(function (ifname) {
            let alias = 0;

            ifaces[ifname].forEach(function (iface) {
                if ('IPv4' !== iface.family || iface.internal !== false) {
                    // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                    return;
                }

                if (alias >= 1) {
                    // this single interface has multiple ipv4 addresses
                    result[ifname + ":" + alias] = iface.address;
                } else {
                    // this interface has only one ipv4 adress
                    result[ifname] = iface.address;
                }
                ++alias;
            });
        });

        return result;
    },

    getLogFileNames: () => logFileNames,
    /**
     * @param {string} haystack The string which to check for its ending
     * @param {string} needle The string which could be contained in the haystack
     * @returns {boolean} whether the needle is exactly at the end of the haystack
     */
    endsWith: (haystack, needle) => {
        const lh = haystack.length;
        const ln = needle.length;
        const end = haystack.substring(lh - ln);
        return end === needle;
    },
    /**
     * @param leFloat {number} The float to pretty-print
     * @param leDecimals {number} The amount of decimals to use for pretty-printing
     * @returns {string} The pretty-printed float
     */
    roundStringWithDecimals: (leFloat, leDecimals) => {
        let s = "" + leFloat;
        const index = s.indexOf(".");
        if (index > 0) {
            s = s.substring(0, index + leDecimals);
        }
        return s;
    },
    /**
     * @param oldDate {Date} The date for which to get the difference
     * @returns {string} a 'mm:ss' representation of the difference between given date and now
     */
    timeSince: (oldDate) => {
        const now = new Date();
        const diffSeconds = Math.round((now.getTime() - oldDate.getTime()) / 1000);
        return Math.round(diffSeconds / 60) + ":" + padTo(diffSeconds % 60, 2);
    },
}