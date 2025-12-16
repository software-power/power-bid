

const express = require('express');
const router = express.Router();

const { sayHello,getUsers } = require('../Controllers/mcheniController');

// Define route: GET /hello
router.get('/', sayHello);
router.get('/users', getUsers);

module.exports = router;
