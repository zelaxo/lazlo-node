const uniqid = require('uniqid');

//id generator
function idgen() {
    let prefix = new Date().toISOString().substr(0, 10);
    return id = uniqid(`${prefix}@`);
}
module.exports.idgen = idgen;

//operator comparison for simple where clause
function whereComp(key, op, val) {
    let output = [];

    if (op === 'eq') {
        dbcache.forEach((obj) => {
            if (obj[key] == val) {
                output.push(obj);
            }
        });
    } else if (op === 'ne') {
        dbcache.forEach((obj) => {
            if (obj[key] != val) {
                output.push(obj);
            }
        });
    } else if (op === 'gt') {
        dbcache.forEach((obj) => {
            if (obj[key] > val) {
                output.push(obj);
            }
        });
    } else if (op === 'lt') {
        dbcache.forEach((obj) => {
            if (obj[key] < val) {
                output.push(obj);
            }
        });
    } else if (op === 'gteq') {
        dbcache.forEach((obj) => {
            if (obj[key] > val || obj[key] == val) {
                output.push(obj);
            }
        });
    } else if (op === 'lteq') {
        dbcache.forEach((obj) => {
            if (obj[key] < val || obj[key] == val) {
                output.push(obj);
            }
        });
    } else {
        output = null;
    }
    return output;
}
module.exports.whereComp = whereComp;

//check if a property exists in atleast one record in a doc
function propExists(prop) {
    let exists = false;
    dbcache.forEach((obj) => {
        if(obj.hasOwnProperty(prop))
            return exists = true;
    });
    return exists;
}
module.exports.propExists = propExists;