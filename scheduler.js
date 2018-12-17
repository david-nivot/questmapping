var CronJob = require('cron').CronJob;
var ReportController = require('./controllers/report');
var BotController = require('./controllers/bot');

module.exports = {

    init(timezone) {

        //Daily reset
        new CronJob('45 59 23 * * *', function() {
            ReportController.scheduledReset();
            BotController.removeMessages("NewQuest");
        }, null, true, timezone);

    }

}
