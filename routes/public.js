var express = require('express');
var router = express.Router();
var MapLayerController = require('../controllers/map_layer');

router.get("/layer/1", MapLayerController.getDefaultLayer);
router.get("/layer/:id", MapLayerController.getLayer);

module.exports = router;
