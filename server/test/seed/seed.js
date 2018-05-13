const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');


const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const  users = [{
    _id : userOneId,
    email: 'charles@charles.com',
    password: 'charles123',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userOneId, access: 'auth'}, process.env.JWT_SECRET).toString()
        }]
    },{
        _id: userTwoId,
        email: 'daniel@daniel.com',
        password: 'daniel123',
        tokens: [{
            access: 'auth',
            token: jwt.sign({_id: userTwoId, access: 'auth'}, process.env.JWT_SECRET).toString()
            }]
    }];

const todos = [{
    _id : new ObjectID(), 
    text: "First test todo",
    _creator: userOneId
}, {
    _id : new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: new Date().getTime(),
    _creator: userTwoId
}];

const populateTodos = (done) => {
    Todo.remove({}).then(() => {
         return Todo.insertMany(todos);
    }).then(() => done())
    .catch((e) => done(e));
};

const populateUsers = (done) => {
    User.remove({}).then(() => {
        const userOne = new User(users[0]).save();
        const userTwo  = new User(users[1]).save();
        
        return Promise.all([userOne, userTwo]);
    }).then(() => done())
    .catch((e) => done(e));
};
module.exports = {todos, users, populateUsers, populateTodos};