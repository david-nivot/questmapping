const moment = require('moment');
const Report = require('../models').Report;
const User = require('../models').User;
const UserGroup = require('../models').UserGroup;
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

    async getErrorList(req, res) {

        var errors = await Report.findAll({
            where: { EditorId: { $ne: null } },
            attributes: ["id", "createdAt", "updatedAt"],
            include: [
                {
                    model: User,
                    attributes: ["id", "name", "credentials"],
                    include: { model: UserGroup, attributes: ["color"] },
                }, {
                    model: User, as: "Editor",
                    attributes: ["name"],
                    include: { model: UserGroup, attributes: ["color"] },
                }, {
                    model: Poi,
                    attributes: ["name"],
                }
            ]
        });
        errors = errors.map( e => {
            return {
                id: e.id,
                createdAt: moment(e.createdAt).format("DD/MM à HH:mm"),
                updatedAt: moment(e.updatedAt).format("DD/MM à HH:mm"),
                userid: e.User.id,
                username: e.User.name,
                userIsBanned: e.User.credentials === 0,
                usercolor: e.User.UserGroup.color,
                poi: e.Poi.name,
                editorname: e.Editor.name,
                editorcolor: e.Editor.UserGroup.color,
                canDelete: req.session.credentials >= 5,
            }
        });
        View.render(req, res, 'pages/admin/errorList', {
            title: "Erreurs signalées",
            errors
        });
    },

    async reset(req, res) {
        var count = await deleteAll() + 2;
        bot.sendQuestLine("ForcedQuestReset", [count]);
        bot.removeMessages("NewQuest");
        return res.redirect('/admin/');
    },

    async scheduledReset() {
        var count = await deleteAll() + 2;
        bot.sendQuestLine("DailyQuestReset", [count]);
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
                    bot.sendAdminLine("ReportHasError", [editor.name, report.User.name, report.Poi.name]);
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

    async delete(req, res) {
        await Report.destroy({ where: { id: req.params.id } });
        return res.redirect('/admin/report/errors');
    },

}
