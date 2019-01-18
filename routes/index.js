var express = require('express');
var router = express.Router();
var UserController = require('../controllers/user');
const View = require('../views');

router.get('/', function(req, res, next) {
    View.render(req, res, 'pages/index', {
        title: 'QuestMapping'
    });
});

router.get('/credentials', async function(req, res, next) {
    var admins = await UserController.getAdminList(req, res);
    View.render(req, res, 'pages/credentials', {
        title: 'Droits insuffisants',
        message: "Veuillez vous rapprocher d'un administrateur pour que votre compte soit validé.",
        admins,
    });
});

router.get('/suspended', async function(req, res, next) {
    var admins = await UserController.getAdminList(req, res);
    View.render(req, res, 'pages/credentials', {
        title: 'Compte suspendu',
        message: "Veuillez contacter un administrateur pour de plus amples informations.",
        admins,
    });
});

router.get('/blog', function(req, res, next) {
    View.render(req, res, 'pages/blog', {
        title: 'QuestMapping'
    });
});

router.get('/login', UserController.login);
router.post('/login', UserController.doLogin);

router.get('/logout', UserController.logout);

router.get('/register', UserController.register);
router.post('/register', UserController.doRegister);

module.exports = router;
