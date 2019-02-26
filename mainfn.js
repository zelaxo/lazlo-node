const fs = require('fs');
const mkdir = require('mkdirp');
const lodash = require('lodash');
const msgpack = require('msgpack-lite');
const cfn = require('./cfn');

function connect(source,db,callback) {
    let p = `${source}/${db}`;
    if(fs.existsSync(p)) {
        process.env.SOURCE = source;
        process.env.CURDB = db;
        if(callback)
            callback(null,true);
    }
    else {
        if(fs.existsSync(source)) {
            mkdir(p, (err) => {
                if(callback)
                    callback(err?err : null, err?false : true);
            });
            process.env.SOURCE = source;
            process.env.CURDB = db;
        }
        else {
            if(callback)
                callback('Source does not exist !', false);
        }
    }
}
module.exports.connect = connect;

function doc(docname,callback) {
    let p = `${process.env.SOURCE}/${process.env.CURDB}/${docname}.laz`;
    let dbpath = `${process.env.SOURCE}/${process.env.CURDB}`;
    if(fs.existsSync(p)) {
        process.env.CURDOC = docname;
        dbcache = [];  //clearing previous cache
        if(callback)
            callback(null,true)
    }
    else {
        if(fs.existsSync(dbpath)) {
            fs.writeFileSync(p, '');
            process.env.CURDOC = docname;
            dbcache = [];  //clearing previous cache
            if(callback)
                callback(null,true);
        }
        else {
            if(callback)
                callback('Database connection not established !',false);
        }
    }
}
module.exports.doc = doc;

function insertOne(input,callback) {
    let p = `${process.env.SOURCE}/${process.env.CURDB}/${process.env.CURDOC}.laz`;
    if (process.env.CURDB !== null && fs.existsSync(p)) {
        try {
            object = JSON.parse(input);
        } catch (e) {
            let err = 'Syntactical error detected !';
            if (callback)
                callback(err,null);
        }
        if (dbcache.length !== 0) {
            //Using preloaded cache data for fast insertion
            object._id = cfn.idgen();
            dbcache.push(object);
            let buffer = msgpack.encode(dbcache);
            fs.writeFile(p, buffer, (err) => {
                if (err) throw err;
            });
            if (callback)
                callback(null,object);
            // cfn.docEntryLog(1,docname,true);
        } else {
            //Normal Insertion
            if (fs.statSync(p).size !== 0) {
                let buffer = fs.readFileSync(p);
                dbcache = msgpack.decode(buffer);
            }
            object._id = cfn.idgen();
            dbcache.push(object);
            let buffer = msgpack.encode(dbcache);
            fs.writeFile(p, buffer, (err) => {
                if (err) throw err;
            });
            if (callback)
                callback(null,object);
            // cfn.docEntryLog(1,docname,true);
        }
    } else {
        let err = 'Database or the document is not accessible !';
        if (callback)
            callback(err,null);
    }
}
module.exports.insertOne = insertOne;

function insert(input,callback) {
    let p = `${process.env.SOURCE}/${process.env.CURDB}/${process.env.CURDOC}.laz`;
    if (process.env.CURDB !== null && fs.existsSync(p)) {
        try {
            array = JSON.parse(input);
        } catch (e) {
            let err = 'Syntactical error detected !';
            if (callback)
                callback(err,null);
        }
        if (dbcache.length !== 0) {
            //Using preloaded cache data for fast insertion
            array.forEach((object) => {
                object._id = cfn.idgen();
                dbcache.push(object);
            });
            let buffer = msgpack.encode(dbcache);
            fs.writeFile(p, buffer, (err) => {
                if (err) throw err;
            });
            if (callback)
                callback(null,array);
            // cfn.docEntryLog(array.length,docname,true);
        } else {
            //Normal Insertion
            if (fs.statSync(p).size !== 0) {
                let buffer = fs.readFileSync(p);
                dbcache = msgpack.decode(buffer);
            }
            array.forEach((object) => {
                object._id = cfn.idgen();
                dbcache.push(object);
            });
            let buffer = msgpack.encode(dbcache);
            fs.writeFile(p, buffer, (err) => {
                if (err) throw err;
            });
            if (callback)
                callback(null,array);
            // cfn.docEntryLog(array.length,docname,true);
        }
    } else {
        let err = 'Database or the document is not accessible !';
        if (callback)
            callback(err,null);
    }
}    
module.exports.insert = insert;

function fetchAll(callback) {
    let p = `${process.env.SOURCE}/${process.env.CURDB}/${process.env.CURDOC}.laz`;
        if (process.env.CURDB !== null && fs.existsSync(p)) {
            if (dbcache.length !== 0) {
                //Fast retrieval using cache
                if(callback)
                    callback(null,dbcache)
            } else {
                //Normal retrieval
                if (fs.statSync(p).size !== 0) {
                    let buffer = fs.readFileSync(p);
                    dbcache = msgpack.decode(buffer);
                    if(callback)
                        callback(null,dbcache);   
                } else {
                    let err = 'Document is empty !';
                    if (callback)
                        callback(err,null);
                }
            }
        } else {
            let err = 'Database or the document is not accessible !';
            if (callback)
                callback(err,null);
        }
    }
module.exports.fetchAll = fetchAll;

function fetch(key,val,op='eq',callback) {
    let p = `${process.env.SOURCE}/${process.env.CURDB}/${process.env.CURDOC}.laz`;
    let output;
    let error;
    if (process.env.CURDB !== null && fs.existsSync(p)) {
        if (dbcache.length !== 0) {
            //fast retrieval using cache
            if(!cfn.propExists(key)) {
                error = 'Property does not exist in any record !';
                if (callback)
                    callback(error,null);
            }
            else {
                output = cfn.whereComp(key, op, val);
                if (output !== null) {
                    if (callback)
                        callback(null,output)
                } else {
                    error = 'Operator not recognized !';
                    if (callback)
                        callback(error,null);
                }
            }
        } else {
            //normal retrieval
            if (fs.statSync(p).size !== 0) {
                fs.readFile(p, (err, data) => {
                    if (err) {
                        error = 'Data seems to be corrupted !';
                        if (callback)
                            callback(error,null);
                    } else {
                        dbcache = msgpack.decode(data);
                        if(!cfn.propExists(key)) {
                            error = 'Property does not exist in any record !';
                            if (callback)
                                callback(error,null);
                        }
                        else {
                            output = cfn.whereComp(key, op, val);
                            if (output !== null) {
                                if (callback)
                                    callback(null,output)
                            } else {
                                error = 'Operator not recognized !';
                                if (callback)
                                    callback(error,null);
                            }
                        }
                    }
                });
            } else {
                error = 'Document is empty !';
                if (callback)
                    callback(error,null);
            }
        }
    } else {
        error = 'Database or the document is not accessible !';
        if (callback)
            callback(error,null);
    }    
}
module.exports.fetch = fetch;

function update(ipar,ivalue,par,value,callback) {
    let p = `${process.env.SOURCE}/${process.env.CURDB}/${process.env.CURDOC}.laz`;
    let output = [];
    let error;
    if (process.env.CURDB !== null && fs.existsSync(p)) {
        if (dbcache.length !== 0) {
            //fast updation using cache
            dbcache.forEach((obj) => {
                if(obj[ipar] == ivalue) {
                    obj[par] = value;
                    output.push(obj);
                    // cfn.docUpdateLog(obj._id,docname);
                }
            });
            let buffer = msgpack.encode(dbcache);
            fs.writeFile(p, buffer, (err) => {
                if (err) throw err;
            });
            if(output.length === 0) {
                error = 'No record with matching key-value pair found !';
                if(callback)
                    callback(error,null);
            }
            else {
                if(callback)
                    callback(null,output);
            }
        } else {
            //normal updation
            if (fs.statSync(p).size !== 0) {
                fs.readFile(p, (err, data) => {
                    if (err) {
                        error = 'Data seems to be corrupted !';
                        if (callback)
                            callback(error,null);
                    } else {
                        dbcache = msgpack.decode(data);
                        dbcache.forEach((obj) => {
                            if(obj[ipar] == ivalue) {
                                obj[par] = value;
                                output.push(obj);
                                // cfn.docUpdateLog(obj._id,docname);
                            }
                        });
                        let buffer = msgpack.encode(dbcache);
                        fs.writeFile(p, buffer, (err) => {
                            if (err) throw err;
                        });
                        if(output.length === 0) {
                            error = 'No record with matching key-value pair found !';
                            if(callback)
                                callback(error,null);
                        }
                        else {
                            if(callback)
                                callback(null,output);
                        }
                    }
                });
            } else {
                error = 'Document is empty !';
                if (callback)
                    callback(error,null);
            }
        }
    } else {
        error = 'Database or document not accessible !';
        if (callback)
            callback(error,null);
    }        
}
module.exports.update = update;

function remove(par,value,callback) {
    let p = `${process.env.SOURCE}/${process.env.CURDB}/${process.env.CURDOC}.laz`;
    let output = [];
    let error;
    if (process.env.CURDB !== null && fs.existsSync(p)) {
        if (dbcache.length !== 0) {
            //fast deletion using cache
            output = lodash.remove(dbcache, (obj) => {
                return obj[par] == value;
            });
            if(output.length === 0) {
                error = 'No record with matching key-value pair found !';
                if(callback)
                    callback(error,null)
            }
            else {
                let buffer = msgpack.encode(dbcache);
                fs.writeFile(p, buffer, (err) => {
                    if (err) throw err;
                });
                if(callback)
                    callback(null,output)
                // cfn.docEntryLog(output.length,docname,false);
            }
        } else {
            //normal deletion
            if (fs.statSync(p).size !== 0) {
                fs.readFile(p, (err, data) => {
                    if (err) {
                        error = 'Data seems to be corrupted !';
                        if (callback)
                            callback(error,null);
                    } else {
                        dbcache = msgpack.decode(data);
                        output = lodash.remove(dbcache, (obj) => {
                            return obj[par] == value;
                        });
                        if(output.length === 0) {
                            error = 'No record with matching key-value pair found !';
                            if(callback)
                                callback(error,null)
                        }
                        else {
                            let buffer = msgpack.encode(dbcache);
                            fs.writeFile(p, buffer, (err) => {
                                if (err) throw err;
                            });
                            if(callback)
                                callback(null,output)
                            // cfn.docEntryLog(output.length,docname,false);
                        }
                    }
                });
            } else {
                error = 'Document is empty !';
                if (callback)
                    callback(error,null);
            }
        }
    } else {
        error = 'Database or document not accessible !';
        if (callback)
            callback(error,null);
    }
}
module.exports.remove = remove;