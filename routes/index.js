var express = require('express');
var router = express.Router();
var UserController = require('../controllers/user');
const View = require('../views');

router.get('/', function(req, res, next) {
    View.render(req, res, 'pages/index', {
        title: 'QuestMapping'
    });
});

router.get('/credentials', function(req, res, next) {
    View.render(req, res, 'pages/credentials', {
        title: 'Droits insuffisants'
    });
});

router.get('/login', UserController.login);
router.post('/login', UserController.doLogin);

router.get('/logout', UserController.logout);

router.get('/register', UserController.register);
router.post('/register', UserController.doRegister);

module.exports = router;
