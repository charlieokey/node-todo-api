const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose}  = require('./db/mongoose.js');
const {Todo} = require('./models/todo.js');
const {User} = require('./models/user.js');

const app  = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    const todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc) => {
        res.send(doc);
        console.log(JSON.stringify(doc, undefined, 2));
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.status(200).send({todos});
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get('/todos/:id', (req, res) => {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send({err: "Id is invalid"});
    }
    Todo.findById(id).then((todo) => {
        if (todo) {
            return res.status(200).send(todo);
        } else {
            return res.status(404).send({err: "Unable to find todo"});
        }
    }, (e) => res.status(400).send(e));
});

app.listen(3000, () => {
    console.log('Started on port 3000');
});

module.exports = {app};