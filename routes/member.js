var express = require('express');
var router = express.Router();
var PoiController = require('../controllers/poi');
var ReportController = require('../controllers/report');
var maplock = require('../lock');
const View = require('../views');

function checkLock( cb ) {
    return async (req, res, next) => {
        if (maplock.get()) {
            View.render(req, res, 'pages/message', {
                class: "text-danger",
                message: "Une maintenance est en cours, cette action est temporairement indisponible."
            });
        } else {
            return await cb(req, res, next);
        }
    }
}

router.get("/poi/:id", checkLock(PoiController.createReport));
router.get("/report/:id", checkLock(ReportController.reportError));

module.exports = router;
