const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
    _id : new ObjectID(), 
    text: "First test todo"
}, {
    _id : new ObjectID(),
    text: 'Second test todo'
}];

beforeEach((done) => {
    Todo.remove({}).then(() => {
         return Todo.insertMany(todos);
    }).then(() => done());
});

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo test';

        request(app)
        .post('/todos')
        .send({text})
        .expect(200)
        .expect((res) => {
            expect(res.body.text).toBe(text);
        })
        .end((err, res) => {
            if (err) {
                return done(err);
            }
            
            Todo.find({text}).then((todos) => {
                expect(todos.length).toBe(1);
                expect(todos[0].text).toBe(text);
                done();
            }).catch((e) => done(e));
        });
    });

    it('should not create todo with incorrect data', (done) => {
        request(app)
        .post('/todos')
        .send({})
        .expect(400)
        .end((err, res) => {
            if (err) return done(err);
            Todo.find().then((todos) => {
                expect(todos.length).toEqual(2);
                done();
            }).catch((e) => done(err));
        });
    });
});

describe('GET/ todos', () => {
    it('should return some todos', (done) => {
        request(app)
        .get('/todos')
        .expect(200)
        .expect((res) => {
            expect(res.body.todos.length).toBe(2);
        }).end(done);
    });
});

describe('GET/ todos/:id', () => {
    it('should return a todo', (done) => {
        request(app)
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .expect(200)
        .expect((res) => {
            expect(res.body.text).toBe("First test todo");
        }).end(done);
    });

    it('should return a 404 is todo not found', (done) => {
        request(app)
        .get(`/todos/${ObjectID("5ae247b20b1edf6c25302db1").toHexString()}`)
        .expect(404)
        .end(done);
    });

    it('should return 404 for non-object id', (done) => {
        request(app)
        .get('/todos/123')
        .expect(404)
        .end(done);
    });
});