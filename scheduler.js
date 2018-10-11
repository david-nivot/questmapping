var CronJob = require('cron').CronJob;
var ReportController = require('./controllers/report');

module.exports = {

    init(timezone) {

        //Daily reset
        new CronJob('45 59 23 * * *', function() {
            ReportController.scheduledReset();
        }, null, true, timezone);

    }

}
