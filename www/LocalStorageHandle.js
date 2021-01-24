var NativeStorageError = require("./NativeStorageError");

// args = [storageName, property, variable]
function LocalStorageHandle(success, error, intent, operation, args) {
    var storageName = args[0];
    var property = args[1];

    var reference = getReference(storageName, property);
    var variable = args[2];

    var action = getAction(operation);

    switch (action) {
        case "set":
            setItem(reference, variable, success, error);
            break;

        case "get":
            getItem(reference, success, error);
            break;

        case "contains":
            contains(reference, success, error);
            break;

        case "keys":
            keys(storageName, success);
            break;

        case "remove":
            remove(reference, success, error);
            break;

        case "clear":
            clear(storageName, success, error);
            break;

        default:
            console.log("LocalStorageHandle: Unknown operation - " + operation);
            error(NativeStorageError.UNKNOWN_OPERATION);
            break;
    }
}

function setItem(reference, variable, success, error) {
    if (reference === null) {
        error(NativeStorageError.NULL_REFERENCE);
        return;
    }

    try {
        var varAsString = JSON.stringify(variable);
    } catch (err) {
        error(NativeStorageError.JSON_ERROR);
    }

    try {
        localStorage.setItem(reference, varAsString);
        success(variable);
    } catch (e) {
        error(NativeStorageError.NATIVE_WRITE_FAILED);
    }
}

function getItem(reference, success, error) {
    if (reference === null) {
        error(NativeStorageError.NULL_REFERENCE);
        return;
    }

    var item = localStorage.getItem(reference);
    if (item === null) {
        error(NativeStorageError.ITEM_NOT_FOUND);
        return;
    }

    try {
        var obj = JSON.parse(item);
        //console.log("LocalStorage Reading: "+obj);
        success(obj);
    } catch (err) {
        error(NativeStorageError.JSON_ERROR);
    }
}

function contains(reference, success, error) {
    try {
        const r = localStorage.getItem(reference) === null;
        success(r);
    } catch (e) {
        error(e);
    }
}

function keys(storageName, success) {
    var ks = [];
    for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k.startsWith(storageName)) {
            k = getPropertyName(k, storageName);
            ks.push(k);
        }
    }

    success(ks);
}

function remove(reference, success, error) {
    try {
        localStorage.removeItem(reference);
        success();
    } catch (e) {
        error(e);
    }
}

function clear(storageName, success, error) {
    try {
        var ks = [];
        for (var i = 0; i < localStorage.length; i++) {
            var k = localStorage.key(i);
            if (k.startsWith(storageName)) {
                ks.push(k);
            }
        }

        for (var k in ks) {
            localStorage.removeItem(k);
        }

        success();
    } catch (e) {
        error(e);
    }
}

function getAction(operation) {
    if (operation.startsWith("put") || operation.startsWith("set")) {
        return "set";
    }

    if (operation.startsWith("get")) {
        return "get";
    }

    return operation;
}

function getReference(storageName, property) {
    return storageName + "_" + property;
}

function getPropertyName(reference, storageName) {
    return reference.replace(storageName + "_", "");
}

module.exports = LocalStorageHandle;
