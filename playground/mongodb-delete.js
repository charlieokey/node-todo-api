const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server', err);
    }

    console.log('Connected to MongoDB server');

    db.collection('Todos').findOneAndDelete({completed: false}).then((res) => {
        console.log(res);
    }, (err) => {
        console.log('Unable to delete todos', err);
    });

    // db.collection('Todos').find().count().then((count) => {
    //     console.log('Todos', count);
    // }, (err) => {
    //     console.log('Unable to fetch todos', err);
    // });

    // db.close();
}); 