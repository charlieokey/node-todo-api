const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const password = '123!@#';
let hashedPassword;

bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
        hashedPassword = hash;
        console.log(hash);
    });
});

bcrypt.compare(password, hashedPassword, (err, res) => {
    console.log(res);
});
// const data = {
//     id: 4
// };

// const token = jwt.sign(data, '123!@#');
// console.log(token);

// const decoded = jwt.verify(token, '123!@#');
// console.log(decoded);

// const message = 'I am user number 3';
// const hash = SHA256(message).toString();

// console.log('Message:' , message);
// console.log('Hash:', hash);

// const data = {
//     id: 4
// };

// const token = {
//     data,
//     hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
// };

// token.data.id = 5;
// token.hash = SHA256(JSON.stringify(token.data)).toString();

// const resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString();

// if (resultHash === token.hash) console.log('Data was not changed');
// else console.log("Data was changed. Don't trust");