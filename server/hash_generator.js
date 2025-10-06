// server/hash_generator.js
const bcrypt = require('bcryptjs');

const passwordToHash = "admin123"; // Apna pasand ka password yahan likhein

bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(passwordToHash, salt, (err, hash) => {
        if (err) throw err;
        console.log("-----------------------------------------");
        console.log("COPY THIS HASH AND PASTE IT IN MONGODB:");
        console.log(hash); // Yeh HASH aapko MongoDB mein paste karna hai
        console.log("-----------------------------------------");
    });
});