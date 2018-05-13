const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, users, populateUsers,  populateTodos} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo test';

        request(app)
        .post('/todos')
        .set('x-auth', users[0].tokens[0].token)
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
        .set('x-auth', users[0].tokens[0].token)
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
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.body.todos.length).toBe(1);
        }).end(done);
    });
});

describe('GET/ todos/:id', () => {
    it('should return a todo', (done) => {
        const id = todos[0]._id.toHexString();
        request(app)
        .get(`/todos/${id}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).toBe("First test todo");
        }).end(done); 
    });

    it('should return a 404 is todo not found', (done) => {
        request(app)
        .get('/todos/5ae247b20b1edf6c25302db1)')
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });

    it('should return 404 for non-object id', (done) => {
        request(app)
        .get('/todos/123')
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });

    it('should not return a todo made by another user', (done) => {
        const id = todos[1]._id.toHexString();
        request(app)
        .get(`/todos/${id}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done); 
    });
});

describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
        const id = todos[0]._id.toHexString();

        request(app)
        .delete(`/todos/${id}`)
        .set('x-auth', users[0].tokens[0].token)
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
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });

    it('should return 404 if object id is invalid', (done) => {
        request(app)
        .delete('/todos/123')
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });

    it('should not remove a todo mad by a different user', (done) => {
        const id = todos[1]._id.toHexString();

        request(app)
        .delete(`/todos/${id}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end((err, res) => {
            if (err) done(err);
            else {
                expect(Todo.findById(id)).toBeDefined;
                done();
            }
        });
    });
});

describe('PATCH /todos/:id', () => {
    it('should update the todo', (done) => {
        const id = todos[0]._id.toHexString();
        const text = "Going to buy pizza!";
        
        request(app)
        .patch(`/todos/${id}`)
        .set('x-auth', users[0].tokens[0].token)
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
        .set('x-auth', users[1].tokens[0].token)
        .send({text, completed: false})
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).toBe(text);
            expect(res.body.todo.completed).toBe(false);
            expect(res.body.todo.completedAt).toBeNull();
        }).end(done);
    });

    it('should not update the second todo if logged in as first user', (done) => {
        const id = todos[1]._id.toHexString();
        const text = "Going to buy pizza!";
        
        request(app)
        .patch(`/todos/${id}`)
        .set('x-auth', users[0].tokens[0].token)
        .send({text,  completed: true})
        .expect(404)
        .end(done);
    });
});

describe('GET /user/me', () => {
    it('should return user od authenticated', (done) => {
        request(app)
        .get('/users/me')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.body._id).toBe(users[0]._id.toHexString());
            expect(res.body.email).toBe(users[0].email);
        }).end(done);
    });

    it('should return 401 if not authenticated', (done) => {
        request(app)
        .get('/users/me')
        .expect(401)
        .end(done);
    });
});

describe('POST /users', () => {
    it('should create a user', (done) => {
        const email = 'example@example.com';
        const password  ='1234abcd';

            request(app)
            .post('/users')
            .send({email, password})
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeDefined();
                expect(res.body.user._id).toBeDefined();
                expect(res.body.user.email).toBe(email);
                User.findOne({email}).then((user) => {
                    expect(user).toBeDefined();
                    expect(user.password != password);
                }).catch((e) => done(e));
            })
            .end((err) => {
                if (err) return done(err);
                done();
            });
    });

    it('should return validation errors if request invalid', (done) => {
        const email = 'despacito';
        const password = '123abc';

        request(app)
        .post('/users')
        .send({email, password})
        .expect(400)
        .end(done);
    });

    it('should not create user if email in use', (done) => {
        const email = 'charles@charles.com';
        const password  = '1234abcd';

        request(app)
        .post('/users')
        .send({email, password})
        .expect(400)
        .end(done);
    });
});

describe('POST /users/login', () => {
    it('should return a token', (done) => {
        request(app)
        .post('/users/login')
        .send({
            email: users[1].email, 
            password: users[1].password})
        .expect(200)
        .expect((res) => {
            expect(res.headers['x-auth']).toBeDefined();
        })
        .end((err, res) => {
            if (err) return done(err);

            User.findById(users[1]._id).then((user) => {
                expect(user.tokens[1].token).toBe(res.headers['x-auth']);
                done();
            }).catch((e) => done(e));
        });
    });

    it('should return a 400 when user info is wrong', (done) => {
        const email = 'charles@charles.com';
        const password = 'daniel123';

        request(app)
        .post('/users/login')
        .send({email, password})
        .expect(400)
        .end(done);
    });
});

describe('DELETE /users/me/token', () => {
    it('should remove auth token on logout', (done) => {
        request(app)
        .delete('/users/me/token')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect(() => {
            User.findById(users[0]._id).then((user) => {
                expect(user.tokens.lenght === 0);
            }).catch((e) => done(e))
        })
        .end((err, res) => {
            if (err) return done(err);
            done();
        });
    });
});