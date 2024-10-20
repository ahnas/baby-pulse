import bcrypt from 'bcrypt';

const password = 'admin'; // Replace with your desired password
const saltRounds = 10; // You can adjust this for security

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(`Hashed password: ${hash}`);
});