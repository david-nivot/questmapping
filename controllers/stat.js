const moment = require('moment');
const Stat = require('../models').Stat;

module.exports = {

    async incrementHourlyStat(key) {
        var key = key + moment().format("YYMMDDHH");
        var s = await Stat.findOne({
            where: { key },
        });
        if (s) {
            await Stat.increment('value', { where: { key }});
        } else {
            s = await Stat.create({ key });
        }
    },

}
