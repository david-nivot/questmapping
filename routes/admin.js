var express = require('express');
var router = express.Router();
var ReportController = require('../controllers/report');
const View = require('../views');

router.get('/', function(req, res, next) {
    View.render(req, res, 'pages/admin/index', {
        title: 'Administration',
        isAdmin4: req.session.credentials >= 4,
        isAdmin5: req.session.credentials >= 5,
    });
});

//router.get("/members", );
router.get("/report/errors", ReportController.listErrors);
//router.get("/bot", );
//router.get("/commands", );

router.get("/report/reset", ReportController.reset);
router.get("/report/delete/:id", ReportController.delete);

module.exports = router;
