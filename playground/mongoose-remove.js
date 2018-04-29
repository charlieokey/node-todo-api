const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose.js');
const {Todo} = require('./../server/models/todo.js');
const {User} = require('./../server/models/user.js');

//Todo.findOneAndRemove
//Todo.findByIdAndRemove

Todo.findByIdAndRemove("5ae3aabe9b46781cc460a87b").then((todo) => {console.log(todo);});