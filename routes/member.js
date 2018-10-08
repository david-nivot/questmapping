var express = require('express');
var router = express.Router();
var PoiController = require('../controllers/poi');
var ReportController = require('../controllers/report');

router.get("/poi/:id", PoiController.createReport);
router.get("/report/:id", ReportController.reportError);

module.exports = router;
