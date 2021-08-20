const path = require('path');
const fileUpload = require('express-fileupload');
const express = require('express');
const dotenv = require('dotenv');
const login = require('./routes/login');
const register = require('./routes/register');
const app = express();

dotenv.config({ path: './config/config.env' });

app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/v1/login', login);
app.use('/v1/register', register);

app.listen(3000, () => {
    console.log("Server is running on PORT 3000");
});