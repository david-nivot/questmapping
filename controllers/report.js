const Report = require('../models').Report;
const User = require('../models').User;
const Poi = require('../models').Poi;
const bot = require("./bot");
const View = require('../views');

async function deleteAll() {
    return await Report.destroy({
        where: {
            EditorId: { $eq: null }
        }
    });
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

    async reportError(req, res) {
        var report = await Report.findOne({
            where: { id: req.params.id },
            include: [User, Poi]
        })

        if(report) {
            //Si auto signalement, on supprime directement le rapport
            if(report.User.id === req.session.userid) {
                await Report.destroy({ where: { id: report.id } });
            } else {
                var editor = await User.findOne({ where: { id: req.session.userid } });
                if(editor) {
                    await report.update({ EditorId: editor.id });
                    bot.sendAdminMessage("ReportHasError", [editor.name, report.User.name, report.Poi.name]);
                } else {
                    View.render(req, res, 'pages/message', {
                        class: "text-danger",
                        message: "Erreur de connexion."
                    });
                }
            }
            return res.redirect('/member/poi/' + report.PoiId);
        } else {
            View.render(req, res, 'pages/message', {
                class: "text-danger",
                message: "Ce signalement n'existe pas. Veuillez réessayer."
            });
        }

    },

    delete(req, res) {
        Report.destroy({ where: { id: req.params.id } });
    },

}
