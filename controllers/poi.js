const Poi = require('../models').Poi;
const QuestGroup = require('../models').QuestGroup;
const Quest = require('../models').Quest;
const Report = require('../models').Report;
const sequelize = require('../models').sequelize;
const bot = require("./bot");

const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];

async function fetchQuests(group) {

    var groups = await QuestGroup.findAll({
        where: { QuestGroupId: { $eq: group || null } },
        include: [ {
            model: Quest,
            required: false,
        } ],
    })

    //Si aucun groupe enfant, on recupere le groupe lui-même et ses quests
    if (groups.length === 0) {
        groups = await QuestGroup.findAll({
            where: { id: group },
            include: [ Quest ],
        })
    }

    var data = [];

    //Si un seul groupe, on va afficher ses quests
    if (groups.length === 1) {
        groups[0].Quests.forEach( quest => {
            data.push({
                isGroup:false, uri:"?quest="+quest.id, goal:quest.goal, reward:quest.reward, icon:getImageLink(groups[0].icon)
            });
        });
    } else { //Si plusieurs groupes, on va transformer les groupes mono-quest en quest, ou garder le groupe
        groups.forEach( group => {
            if (group.Quests.length === 1 ) {
                var quest = group.Quests[0];
                data.push({
                    isGroup:false, uri:"?quest="+quest.id, goal:quest.goal, reward:quest.reward, icon:getImageLink(group.icon)
                });
            } else {
                data.push({
                    isGroup:true, uri:"?group="+group.id, name: group.name, icon:getImageLink(group.icon)
                });
            }
        });
    }

    return data;

}

function getImageLink( id ) {
    return config.imgProvider.replace("{{ID}}", id);
}

module.exports = {
    async createReport(req, res) {

        var poi = await Poi.findOne({ where: { id :req.params.id } });

        if(!poi) {
            res.locals.message = "Lieu non existant";
            res.status(404);
            res.render('pages/error');
            return;
        }

        var report = await Report.findOne({
            where: { PoiId: req.params.id },
            include: [ {
                model: Quest
            } ],
        })

        //Si un rapport existe déjà
        if (report) {
            res.locals = {
                target: config.frontUrl + "#17/" + poi.latitude + "/" + poi.longitude,
                message: "Un signalement existe déjà pour ce lieu."
            }
            res.render('pages/member/poi/report/result', { partials: {head: 'partials/head'}});
        } else {
            //Si une quête a été selectionnée
            if(req.query.quest) {
                var target = config.frontUrl + "#17/" + poi.latitude + "/" + poi.longitude;

                report = await Report.create({
                    PoiId: req.params.id, QuestId: req.query.quest, UserId: req.session.userid
                });

                if(bot.isActive) {
                    var quest = await Quest.findOne({ where: { id: req.query.quest } });
                    bot.sendPublicMessage("NewQuest", [poi.name, quest.goal, quest.reward, target]);
                }

                res.locals = {
                    target,
                    message: report
                        ? "Enregistrement terminé."
                        : "Echec de la création du signalement."
                }
                res.render('pages/member/poi/report/result', { partials: {head: 'partials/head'}});
            } else {
                var quests = await fetchQuests(req.query.group);
                res.locals = {
                    quests,
                }
                res.render('pages/member/poi/report/create', { partials: {head: 'partials/head'}});
            }
        }
    }
}
