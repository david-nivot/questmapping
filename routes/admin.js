var express = require('express');
var router = express.Router();
var auth = require('./auth');
var ReportController = require('../controllers/report');
var UserController = require('../controllers/user');
var BotController = require('../controllers/bot');
var maplock = require('../lock');
const View = require('../views');

router.get('/', function(req, res, next) {
    View.render(req, res, 'pages/admin/index', {
        title: 'Administration',
        isAdmin4: req.session.credentials >= 4,
        isAdmin5: req.session.credentials >= 5,
    });
});

router.get("/user/pending", auth.authorize(UserController.getPendingUsers, 3));
router.get("/user/banned", auth.authorize(UserController.getBannedUsers, 3));
router.post("/user/update/:id", auth.authorize(UserController.updateUser, 3));

router.get("/report/errors", auth.authorize(ReportController.getErrorList, 3));

router.get('/bot', auth.authorize(async function(req, res, next) {
    var messages = await BotController.getMessages();
    View.render(req, res, 'pages/admin/bot', {
        title: 'Commandes bot',
        isSuperAdmin: req.session.credentials >= 6,
        messages,
    });
}, 4));
router.post("/bot/message", auth.authorize(BotController.createMessage, 4));

router.get('/commands', auth.authorize(function(req, res, next) {
    View.render(req, res, 'pages/admin/commands', {
        title: 'Commandes admin',
        isSuperAdmin: req.session.credentials >= 6,
        MapStatus: maplock.get() ? "oui" : "non",
    });
}, 5));

//Temporary code to lock map
router.get("/commands/lock", auth.authorize( (req, res) => {
    maplock.set(true);
    res.redirect(req.header('Referer') || '/admin');
}, 5));
router.get("/commands/unlock", auth.authorize( (req, res) => {
    maplock.set(false);
    res.redirect(req.header('Referer') || '/admin');
}, 5));

router.get("/report/reset", auth.authorize(ReportController.reset, 5));
router.get("/report/delete/:id", auth.authorize(ReportController.delete, 5));

module.exports = router;
