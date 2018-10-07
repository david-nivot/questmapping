var express = require('express');
var router = express.Router();
var ReportController = require('../controllers/report');

router.get('/', function(req, res, next) {

});

router.get("/report/reset", ReportController.reset);
router.get("/report/delete/:id", ReportController.delete);

module.exports = router;
