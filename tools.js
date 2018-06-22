

const log = function (prefix, args) {
    let toLog = "[" + prefix + "] ";
    for (let arg of args) {
        if (typeof arg === "object") {
            console.log("arg is object", arg);
            toLog += safeStringify(arg) + " ";
        } else {
            toLog += arg + " ";
        }
    }
    console.log(`${new Date().toISOString()} ${toLog}`);
};

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
                throw err;
            } else {
                data[fieldName] = JSON.parse(readData);
                callback();
            }
        });
    }
}