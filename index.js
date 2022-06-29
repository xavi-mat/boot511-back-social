'use strict';
const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 8080;
const { dbConnection } = require("./config/config");
const { typeError } = require("./middleware/errors");
const swaggerUI = require("swagger-ui-express");
const docs = require("./docs/index");

app.use(express.json());
app.use(express.static('public'));

dbConnection();

app.use('/users', require('./routes/users'));
app.use('/posts', require('./routes/posts'));
app.use('/comments', require('./routes/comments'));

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(docs));

app.use(typeError);

app.listen(PORT, console.log(`Server running on port ${PORT}`));