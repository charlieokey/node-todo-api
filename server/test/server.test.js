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
    text: 'Second test todo',
    completed: true,
    completedAt: new Date().getTime()
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
        const id = todos[0]._id.toHexString();
        request(app)
        .get(`/todos/${id}`)
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).toBe("First test todo");
        }).end(done); 
    });

    it('should return a 404 is todo not found', (done) => {
        request(app)
        .get('/todos/5ae247b20b1edf6c25302db1)')
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

describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
        const id = todos[0]._id.toHexString();

        request(app)
        .delete(`/todos/${id}`)
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).toBe('First test todo');
        }).end((err, res) => {
            if (err) done(err);
            else {
                expect(Todo.findById(id)).toNotExist;
                done();
            }
        });
    });

    it('should return a 404 if todo not found', (done) => {
        request(app)
        .delete('/todos/5ae247b20b1edf6c25302db1')
        .expect(404)
        .end(done);
    });

    it('should return 404 if object id is invalid', (done) => {
        request(app)
        .delete('/todos/123')
        .expect(404)
        .end(done);
    });
});

describe('PATCH /todos/:id', () => {
    it('should update the todo', (done) => {
        const id = todos[0]._id.toHexString();
        const text = "Going to buy pizza!";
        
        request(app)
        .patch(`/todos/${id}`)
        .send({text,  completed: true})
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).toBe(text);
            expect(res.body.todo.completed).toBe(true);
            expect(typeof(res.body.todo.completedAt)).toBe('number');
        }).end(done);
    });

    it('should clear completdAt when todo is not completd', (done) => {
        const id = todos[1]._id.toHexString();
        const text = "Coming back with pizza";

        request(app)
        .patch(`/todos/${id}`)
        .send({text, completed: false})
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).toBe(text);
            expect(res.body.todo.completed).toBe(false);
            expect(res.body.todo.completedAt).toBeNull();
        }).end(done);
    })
});