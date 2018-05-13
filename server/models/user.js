const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const {ObjectID} = require('mongodb');

const UserSchema = new mongoose.Schema ({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },

    password: {
        type: String,
        required: true,
        minlength: 8
    },
    
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

UserSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    return _.pick(userObject, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function () {
    const user = this;
    const access = 'auth';
    const token = jwt.sign({_id: user._id, access}, process.env.JWT_SECRET).toString();

    user.tokens.push({access, token});

    return user.save().then(() => token);
};

UserSchema.methods.removeToken = function (token) {
    const user = this;

    return user.update({
        $pull: {
            tokens: {token}
        }
    });
};

UserSchema.statics.findByToken = function (token) {
    const User = this;
    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        return Promise.reject(e);
    }
    return User.findOne({
        '_id': decoded._id
        // 'tokens.token': token, 
        // 'tokens.access': 'auth'
    });
};

UserSchema.statics.findByCred = function (email, password) {
    const User = this;
    
    return User.findOne({email}).then((user) => {
        if (!user) {
            return Promise.reject();
        }

        return bcrypt.compare(password, user.password).then((result) => {
            if (result) return user;
            else return Promise.reject('Incorrect password');
        });
    });
};

UserSchema.pre('save', function(next) {
    const user = this;

    if(user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = {User};