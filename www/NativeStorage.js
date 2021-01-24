var inBrowser = false;
var NativeStorageError = require("./NativeStorageError");

var pluginFeatureName = "EightbhsNativeStorage";

function isInBrowser() {
    inBrowser = (window.cordova && (window.cordova.platformId === "browser" || window.cordova.platformId === "osx")) || !(window.phonegap || window.cordova);
    return inBrowser;
}

function storageSupportAnalyse() {
    if (!isInBrowser()) {
        // use cordova native
        //storageHandlerDelegate = exec;
        return 0;
    } else {
        if (window.localStorage) {
            // Use browser local storage
            //storageHandlerDelegate = localStorageHandle;
            return 1;
        } else {
            // Error - browser does not support local storage
            //console.log("ALERT! localstorage isn't supported");
            return 2;
        }
    }
}

//if storage not available gracefully fails, no error message for now
function StorageHandle() {
    this.storageSupport = storageSupportAnalyse();
    switch (this.storageSupport) {
        case 0:
            var exec = require("cordova/exec");
            this.storageHandlerDelegate = exec;
            break;
        case 1:
            var localStorageHandle = require("./LocalStorageHandle");
            this.storageHandlerDelegate = localStorageHandle;
            break;
        case 2:
            console.error("ALERT! localstorage isn't supported");
            break;
        default:
            console.error("StorageSupport Error: Unknown storageSupport value - " + this.storageSupport);
            break;
    }
}

StorageHandle.prototype.initWithSuiteName = function (success, error, suiteName) {
    if (suiteName === null) {
        error("Null suiteName isn't supported");
        return;
    }
    this.storageHandlerDelegate(success, error, pluginFeatureName, "initWithSuiteName", [suiteName]);
};

StorageHandle.prototype.set = function (success, error, storageName, property, value) {
    //if error is null then replace with empty function to silence warnings
    if (!error) {
        error = function () {};
    }

    if (property === null) {
        error("The property can't be null");
        return;
    }
    if (value === null) {
        error("a Null value isn't supported");
        return;
    }
    switch (typeof value) {
        case "undefined":
            error("an undefined type isn't supported");
            break;
        case "boolean": {
            this.putBoolean(storageName, property, value, success, error);
            break;
        }
        case "number": {
            // Good now check if it's a float or an int
            if (value === +value) {
                if (value === (value | 0)) {
                    // it's an int
                    this.putInt(storageName, property, value, success, error);
                } else if (value !== (value | 0)) {
                    this.putDouble(storageName, property, value, success, error);
                }
            } else {
                error("The value doesn't seem to be a number");
            }
            break;
        }
        case "string": {
            this.putString(storageName, property, value, success, error);
            break;
        }
        case "object": {
            this.putObject(storageName, property, value, success, error);
            break;
        }
        default:
            error("The type isn't supported or isn't been recognized");
            break;
    }
};

/* removing */
StorageHandle.prototype.remove = function (success, error, storageName, property) {
    //if error is null then replace with empty function to silence warnings
    if (!error) {
        error = function () {};
    }

    if (property === null) {
        error("Null property isn't supported");
        return;
    }

    this.storageHandlerDelegate(success, error, pluginFeatureName, "remove", [storageName, property]);
};

/* clearing */
StorageHandle.prototype.clear = function (success, error, storageName) {
    //if error is null then replace with empty function to silence warnings
    if (!error) {
        error = function () {};
    }

    this.storageHandlerDelegate(success, error, pluginFeatureName, "clear", [storageName]);
};

/* boolean storage */
StorageHandle.prototype.putBoolean = function (success, error, storageName, property, aBoolean) {
    //if error is null then replace with empty function to silence warnings
    if (!error) {
        error = function () {};
    }

    if (property === null) {
        error("Null property isn't supported");
        return;
    }

    if (aBoolean === null) {
        error("a Null value isn't supported");
        return;
    }

    if (typeof aBoolean === "boolean") {
        this.storageHandlerDelegate(
            function (returnedBool) {
                if ("string" === typeof returnedBool) {
                    if (returnedBool === "true") {
                        success(true);
                    } else if (returnedBool === "false") {
                        success(false);
                    } else {
                        error("The returned boolean from SharedPreferences was not recognized: " + returnedBool);
                    }
                } else {
                    success(returnedBool);
                }
            },
            error,
            pluginFeatureName,
            "putBoolean",
            [storageName, property, aBoolean]
        );
    } else {
        error("Only boolean types are supported");
    }
};

StorageHandle.prototype.getBoolean = function (success, error, storageName, property) {
    //if error is null then replace with empty function to silence warnings
    if (!error) {
        error = function () {};
    }

    if (property === null) {
        error("Null property isn't supported");
        return;
    }
    this.storageHandlerDelegate(
        function (returnedBool) {
            if ("string" === typeof returnedBool) {
                if (returnedBool === "true") {
                    success(true);
                } else if (returnedBool === "false") {
                    success(false);
                } else {
                    error("The returned boolean from SharedPreferences was not recognized: " + returnedBool);
                }
            } else {
                success(returnedBool);
            }
        },
        error,
        pluginFeatureName,
        "getBoolean",
        [storageName, property]
    );
};

/* int storage */
StorageHandle.prototype.putInt = function (success, error, storageName, property, anInt) {
    //if error is null then replace with empty function to silence warnings
    if (!error) {
        error = function () {};
    }

    if (property === null) {
        error("Null property isn't supported");
        return;
    }
    this.storageHandlerDelegate(success, error, pluginFeatureName, "putInt", [storageName, property, anInt]);
};

StorageHandle.prototype.getInt = function (success, error, storageName, property) {
    //if error is null then replace with empty function to silence warnings
    if (!error) {
        error = function () {};
    }

    if (property === null) {
        error("Null property isn't supported");
        return;
    }
    this.storageHandlerDelegate(success, error, pluginFeatureName, "getInt", [storageName, property]);
};

/* float storage */
StorageHandle.prototype.putDouble = function (success, error, storageName, property, aFloat) {
    //if error is null then replace with empty function to silence warnings
    if (!error) {
        error = function () {};
    }

    if (property === null) {
        error("Null property isn't supported");
        return;
    }
    this.storageHandlerDelegate(success, error, pluginFeatureName, "putDouble", [storageName, property, aFloat]);
};

StorageHandle.prototype.getDouble = function (success, error, storageName, property) {
    //if error is null then replace with empty function to silence warnings
    if (!error) {
        error = function () {};
    }

    if (property === null) {
        error("Null property isn't supported");
        return;
    }
    this.storageHandlerDelegate(
        function (data) {
            if (isNaN(data)) {
                error("Expected double but got non-number");
            } else {
                success(parseFloat(data));
            }
        },
        error,
        pluginFeatureName,
        "getDouble",
        [storageName, property]
    );
};

/* string storage */
StorageHandle.prototype.putString = function (success, error, storageName, property, s) {
    //if error is null then replace with empty function to silence warnings
    if (!error) {
        error = function () {};
    }

    if (property === null) {
        error("Null property isn't supported");
        return;
    }
    this.storageHandlerDelegate(success, error, pluginFeatureName, "putString", [storageName, property, s]);
};

StorageHandle.prototype.getString = function (success, error, storageName, property) {
    //if error is null then replace with empty function to silence warnings
    if (!error) {
        error = function () {};
    }

    if (property === null) {
        error("Null property isn't supported");
        return;
    }
    this.storageHandlerDelegate(success, error, pluginFeatureName, "getString", [storageName, property]);
};

/* object storage  COMPOSITE AND DOESNT CARE FOR BROWSER*/
StorageHandle.prototype.putObject = function (success, error, storageName, property, obj) {
    //if error is null then replace with empty function to silence warnings
    if (!error) {
        error = function () {};
    }

    var objAsString = "";
    try {
        objAsString = JSON.stringify(obj);
    } catch (err) {
        error(err);
    }
    this.putString(
        storageName,
        property,
        objAsString,
        function (data) {
            var obj = {};
            try {
                obj = JSON.parse(data);
                success(obj);
            } catch (err) {
                error(err);
            }
        },
        error
    );
};

StorageHandle.prototype.getObject = function (success, error, storageName, property) {
    //if error is null then replace with empty function to silence warnings
    if (!error) {
        error = function () {};
    }

    this.getString(
        storageName,
        property,
        function (data) {
            var obj = {};
            try {
                obj = JSON.parse(data);
                success(obj);
            } catch (err) {
                error(err);
            }
        },
        error
    );
};

/* API >= 2 */
StorageHandle.prototype.setItem = function (success, error, storageName, property, obj) {
    //if error is null then replace with empty function to silence warnings
    if (!error) {
        error = function () {};
    }

    var objAsString = "";
    try {
        objAsString = JSON.stringify(obj);
    } catch (err) {
        error(new NativeStorageError(NativeStorageError.JSON_ERROR, "JS", err));
        return;
    }
    if (property === null) {
        error(new NativeStorageError(NativeStorageError.NULL_REFERENCE, "JS", ""));
        return;
    }
    this.storageHandlerDelegate(
        function (data) {
            try {
                obj = JSON.parse(data);
                success(obj);
            } catch (err) {
                error(new NativeStorageError(NativeStorageError.JSON_ERROR, "JS", err));
            }
        },
        function (code) {
            error(new NativeStorageError(code, "Native", ""));
        },
        pluginFeatureName,
        "setItem",
        [storageName, property, objAsString]
    );
};

StorageHandle.prototype.getItem = function (success, error, storageName, property) {
    //if error is null then replace with empty function to silence warnings
    if (!error) {
        error = function () {};
    }

    if (property === null) {
        error(new NativeStorageError(NativeStorageError.NULL_REFERENCE, "JS", ""));
        return;
    }
    var obj = {};

    this.storageHandlerDelegate(
        function (data) {
            try {
                obj = JSON.parse(data);
                success(obj);
            } catch (err) {
                error(new NativeStorageError(NativeStorageError.JSON_ERROR, "JS", err));
            }
        },
        function (code) {
            error(new NativeStorageError(code, "Native", ""));
        },
        pluginFeatureName,
        "getItem",
        [storageName, property]
    );
};

/* API >= 2 */
StorageHandle.prototype.setSecretItem = function (success, error, storageName, property, obj, encryptConfig) {
    //if error is null then replace with empty function to silence warnings
    if (!error) {
        error = function () {};
    }

    var objAsString = "";
    try {
        objAsString = JSON.stringify(obj);
    } catch (err) {
        error(new NativeStorageError(NativeStorageError.JSON_ERROR, "JS", err));
        return;
    }
    if (property === null) {
        error(new NativeStorageError(NativeStorageError.NULL_REFERENCE, "JS", ""));
        return;
    }

    var action = "setItem";
    var params = [storageName, property, objAsString];
    switch (encryptConfig.mode) {
        case "password":
            action = "setItemWithPassword";
            params = [storageName, property, objAsString, encryptConfig.value];
            break;
        case "key":
            action = "setItemWithKey";
            break;
        case "none":
            break;
        default: {
            error(new NativeStorageError(NativeStorageError.WRONG_PARAMETER, "JS", ""));
            return;
        }
    }
    this.storageHandlerDelegate(
        function (data) {
            try {
                obj = JSON.parse(data);
                success(obj);
            } catch (err) {
                error(new NativeStorageError(NativeStorageError.JSON_ERROR, "JS", err));
            }
        },
        function (code) {
            error(new NativeStorageError(code, "Native", ""));
        },
        pluginFeatureName,
        action,
        params
    );
};

StorageHandle.prototype.getSecretItem = function (success, error, storageName, property, encryptConfig) {
    //if error is null then replace with empty function to silence warnings
    if (!error) {
        error = function () {};
    }

    if (property === null) {
        error(new NativeStorageError(NativeStorageError.NULL_REFERENCE, "JS", ""));
        return;
    }
    var obj = {};

    var action = "getItem";
    var params = [storageName, property];
    switch (encryptConfig.mode) {
        case "password":
            action = "getItemWithPassword";
            params = [storageName, property, encryptConfig.value];
            break;
        case "key":
            action = "getItemWithKey";
            break;
        case "none":
            break;
        default: {
            error(new NativeStorageError(NativeStorageError.WRONG_PARAMETER, "JS", ""));
            return;
        }
    }

    this.storageHandlerDelegate(
        function (data) {
            try {
                obj = JSON.parse(data);
                success(obj);
            } catch (err) {
                error(new NativeStorageError(NativeStorageError.JSON_ERROR, "JS", err));
            }
        },
        function (code) {
            error(new NativeStorageError(code, "Native", ""));
        },
        pluginFeatureName,
        action,
        params
    );
};

/* list keys */
StorageHandle.prototype.keys = function (success, error, storageName) {
    //if error is null then replace with empty function to silence warnings
    if (!error) {
        error = function () {};
    }

    this.storageHandlerDelegate(success, error, pluginFeatureName, "keys", [storageName]);
};

StorageHandle.prototype.contains = function (success, error, storageName, property) {
    this.storageHandlerDelegate(success, error, pluginFeatureName, "contains", [storageName, property]);
}

var storageHandle = new StorageHandle();
module.exports = storageHandle;
