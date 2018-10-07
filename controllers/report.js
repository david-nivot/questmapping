const Report = require('../models').Report;
const bot = require("./bot");

async function deleteAll() {
    return await Report.destroy( {
        where: {
            hasError: false
        }
    } );
}

module.exports = {

    async reset(req, res) {
        var count = await deleteAll();
        bot.sendPublicMessage("ForcedQuestReset", [count]);
        return res.redirect('/admin/');
    },

    async scheduledReset() {
        var count = await deleteAll();
        bot.sendPublicMessage("DailyQuestReset", [count]);
    },

    delete(req, res) {
        //TODO
    },

}
