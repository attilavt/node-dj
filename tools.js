const fs = require('fs');

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

const log = function (prefix, args) {
    let toLog = "[" + prefix + "] ";
    for (let arg of args) {
        if (typeof arg === "object") {
            toLog += safeStringify(arg) + " ";
        } else {
            toLog += arg + " ";
        }
    }
    console.log(`${new Date().toISOString()} ${toLog}`);
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
                log(prefix, arguments);
            }
        };
    },
    readFile: function (data, fieldName, callback) {
        fs.readFile(fieldName + '.json', function (err, readData) {
            if (err) {
                console.error("Error", err);
            } else {
                data[fieldName] = JSON.parse(readData);
                callback();
            }
        });
    },
    shuffle: shuffle,

    getHour: function () {
        return new Date().getHours();
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