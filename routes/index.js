var express = require('express');
var router = express.Router();
var UserController = require('../controllers/user');

router.get('/', function(req, res, next) {
    res.locals = {
        title: 'QuestMapping'
    }
    res.render('pages/index', { partials: {head: 'partials/head'} });
});

router.get('/credentials', function(req, res, next) {
    res.locals = {
        title: 'Droits insuffisants',
        username: req.session.username
    }
    res.render('pages/credentials', { partials: {head: 'partials/head'} });
});

router.get('/login', UserController.login);
router.post('/login', UserController.doLogin);

router.get('/register', UserController.register);
router.post('/register', UserController.doRegister);

module.exports = router;
