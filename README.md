# lazlo-node
### Node Library For Lazlo DB

## Installation
```sh
npm install lazlo-node
```

### You do not need lazlodb installed on your computer to use this library. All important crud operations can be performed, but advanced features like database tracking & complex slice & dice operations can only be performed by installing the complete database.

## Usage

### Connection
#### connect(source,dbname,callback) : Connects to a database present in the defined source. If the database is not present, it is created.
```js
const lazlo = require('lazlo-node');

lazlo.connect(__dirname, 'database', (err) => {
    if(err) throw err;
    console.log('connected !');
});
```

### Document Selection/Creation
#### doc(docname,callback) : Selects a document in the database. If the document is not present, it is created.
```js
lazlo.doc('doc1', (err) => {
    if(err) throw err;
    console.log('Document created');
});
```

### Insertion
#### insertOne(record,callback) : Inserts a single record
#### insert(records,callback) : Insert multiple records
```js
lazlo.insertOne('{"name":"john","age":19}', (err,record) => {
    if(err) return console.log(err);
    console.log(record);
});

let records = JSON.stringify([{name:'joe',age:20},{name:'jack',age:18},{name:'james',age:21}]);

lazlo.insert(records, (err,records) => {
    if(err) return console.log(err);
    console.log(records);
});
```

### Fetching
#### fetchAll(callback) : Fetches all records from the document
#### fetch(key,value,operator,callback) : Fetch specific records fulfilling the condition

#### Operators available :
* eq = equal to
* ne = not equal
* gt = greater than
* lt = lesser than
* gteq = greater than or equal to
* lteq = lesser than or equal to

```js
lazlo.fetchAll((err,data) => {
    if (err) throw err;
    console.log(data);
});

lazlo.fetch('age',18,'gteq',(err,data) => {
    if(err) throw err;
    console.log(data);
});  //will fetch all records having age greater than or equal to 18

lazlo.fetch('name','joe','eq',(err,data) => {
    if(err) throw err;
    console.log(data);
});  //will fetch all records having name joe
```

### Updating
#### update(ikey,ivalue,key,value,callback) : Update records having the identification key-value pair with the new key-value pair
```js
lazlo.update('name','joe','name','zaygo',(err,records) => {
    if(err) throw err;
    console.log(`${records.length} records updated !`);
    console.log(records);
});  //will fetch the records having the name joe & then update their name to zaygo
```

### Deleting
#### remove(key,value,callback) : Remove records having the key value pair
```js
lazlo.remove('name','james',(err,data) => {
    if(err) throw err;
    console.log(`${data.length} records deleted !`);
    console.log(data);
});  //all records having the name james will be removed
```
