const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose.js');
const {Todo} = require('./../server/models/todo.js');
const {User} = require('./../server/models/user.js');

const id = "5ae247b20b1edf6c25302db1";

if (!ObjectID.isValid(id)) {
    return console.log('Id not valid');
}

// Todo.find({
//     _id: id
// }).then((todos) => {
//     console.log('Todos', todos);
// });

// Todo.findOne({
//     _id: id
// }).then((todo) => {
//     console.log('Todo ', todo);
// });

// Todo.findById(id).then((todo) => {
//     if (!todo) {
//         return console.log('Unable to find id');
//     }
//     console.log('Todo By Id', todo);
// }).catch((e) => console.log(e)); 

User.findById(id).then((user) => {
    if (!ObjectID.isValid(id)) {
        return console.log('Id not valid');
    }
    
    if(!user) {
        return console.log('User could not by found');
    }
    console.log('User by ID',  user);
}, (e) => console.log(e))