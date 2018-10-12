var express = require('express');
var router = express.Router();
var ReportController = require('../controllers/report');
var UserController = require('../controllers/user');
var BotController = require('../controllers/bot');
const View = require('../views');

router.get('/', function(req, res, next) {
    View.render(req, res, 'pages/admin/index', {
        title: 'Administration',
        isAdmin4: req.session.credentials >= 4,
        isAdmin5: req.session.credentials >= 5,
    });
});

//router.get("/users", UserController.getUsers);
//router.get("/user/:id", UserController.getUser);
//router.post("/user/search/", UserController.searchUser);
router.get("/report/errors", ReportController.getErrorList);
router.get("/bot", BotController.sayHello);
//router.get("/commands", );

router.get("/report/reset", ReportController.reset);
router.get("/report/delete/:id", ReportController.delete);

module.exports = router;
