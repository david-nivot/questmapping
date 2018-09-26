var express = require('express');
var router = express.Router();
var PoiController = require('../controllers/poi');

router.get("/poi/:id", PoiController.createReport);

module.exports = router;
