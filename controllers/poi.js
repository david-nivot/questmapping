const Poi = require('../models').Poi;
const QuestGroup = require('../models').QuestGroup;
const Quest = require('../models').Quest;
const Report = require('../models').Report;
const sequelize = require('../models').sequelize;
const bot = require("./bot");
const View = require('../views');

const config = require(__dirname + '/../config/config.js');

async function fetchQuests(group) {

    var groups = await QuestGroup.findAll({
        where: { QuestGroupId: { $eq: group || null }, visibility: 1 },
        include: [ {
            model: Quest,
            required: false,
            where: { visibility: 1 }
        } ],
    })

    //Si aucun groupe enfant, on recupere le groupe lui-même et ses quests
    if (groups.length === 0) {
        groups = await QuestGroup.findAll({
            where: { id: group },
            include: [ {
                model: Quest,
                where: { visibility: 1 }
            } ],
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
        for (group of groups) {
            let isQuest = (await QuestGroup.count({ where: { QuestGroupId: group.id } }) +
                await Quest.count({ where: { QuestGroupId: group.id } })) <= 1;
                console.log(group.Quests.length, isQuest)
            if (group.Quests.length >= 1) {
                var quest = group.Quests[0];
                if(isQuest) { //Cas d'une quête
                    data.push({
                        isGroup:false,
                        uri_ok:"?quest="+quest.id,
                        goal:quest.goal,
                        reward:quest.reward,
                        icon:getImageLink(group.icon),
                        color:quest.color,
                    });
                } else { //Cas d'un groupe de quest précisable
                    data.push({
                        isGroup:true,
                        isQuest:true,
                        uri_ok:"?quest="+quest.id,
                        uri_more:"?group="+group.id,
                        goal:quest.goal,
                        reward:quest.reward,
                        icon:getImageLink(group.icon),
                        color:quest.color,

                    });
                }
            } else {
                data.push({
                    isGroup:true,
                    isQuest:false,
                    uri_more:"?group="+group.id,
                    name: group.name,
                    icon:getImageLink(group.icon),
                    color:group.color,
                });
            }
        }
    }
    return data;
}

function getImageLink( id ) {
    return config.imgProvider.replace("{{ID}}", id);
}

module.exports = {
    async createReport(req, res) {

        var poi = await Poi.findOne({ where: { id: req.params.id } });

        if(!poi) {
            View.render(req, res, 'pages/message', {
                class: "text-danger",
                message: "Lieu non existant"
            });
            return;
        }

        var report = await Report.findOne({
            where: { PoiId: req.params.id, EditorId: { $eq: null } },
            include: [ {
                model: Quest
            } ],
        });
        var target = config.frontUrl + "#17/" + poi.latitude + "/" + poi.longitude;

        //Si un rapport existe déjà
        if (report) {
            View.render(req, res, 'pages/message', {
                target,
                class: "text-danger",
                message: "Un signalement existe déjà pour ce lieu."
            });
        } else {
            //Si une quête a été selectionnée
            if(req.query.quest) {
                report = await Report.create({
                    PoiId: req.params.id, QuestId: req.query.quest, UserId: req.session.userid
                });

                if(bot.isActive) {
                    var quest = await Quest.findOne({ where: { id: req.query.quest }, include: [QuestGroup] });
                    if(quest.rarity >= config.telegram.minQuestRarity) {
                        var icon = quest.QuestGroup.iconHD ? "[​​​​​​​​​​​]("+getImageLink(quest.QuestGroup.iconHD)+")" : "";
                        bot.sendQuestLine("NewQuest", [poi.name, quest.goal, quest.reward, target, icon], true);
                    }
                }

                View.render(req, res, 'pages/message', {
                    target,
                    message: report ? "Enregistrement terminé." : "Echec de la création du signalement."
                });
            } else {
                var quests = await fetchQuests(req.query.group);
                View.render(req, res, 'pages/member/createReport', {
                    quests,
                });
            }
        }
    },

    async refineReport(req, res) {

        var poi = await Poi.findOne({ where: { id: req.params.id } });

        if(!poi) {
            View.render(req, res, 'pages/message', {
                class: "text-danger",
                message: "Lieu non existant"
            });
            return;
        }

        var target = config.frontUrl + "#17/" + poi.latitude + "/" + poi.longitude;

        var report = await Report.findOne({
            where: { PoiId: req.params.id, EditorId: { $eq: null } },
            include: [ {
                model: Quest
            } ],
        });

        //Si un rapport existe déjà, on regarde si la quete est précisable
        if (report) {
            var groupCount = await QuestGroup.count({
                where: { QuestGroupId: { $eq: report.Quest.QuestGroupId } }
            });
            if(groupCount > 0) {
                if(req.query.quest) {
                    report.update({
                        QuestId: req.query.quest, UserId: req.session.userid
                    });

                    if(bot.isActive) {
                        var quest = await Quest.findOne({ where: { id: req.query.quest }, include: [QuestGroup] });
                        if(quest.rarity >= config.telegram.minQuestRarity) {
                            var icon = quest.QuestGroup.iconHD ? "[​​​​​​​​​​​]("+getImageLink(quest.QuestGroup.iconHD)+")" : "";
                            bot.sendQuestLine("QuestRefine", [poi.name, quest.goal, quest.reward, target, icon], true);
                        }
                    }

                    View.render(req, res, 'pages/message', {
                        target,
                        message: report ? "Enregistrement terminé." : "Echec de la création du signalement."
                    });
                } else {
                    var quests = await fetchQuests(req.query.group !== undefined ? req.query.group : report.Quest.QuestGroupId);
                    View.render(req, res, 'pages/member/createReport', {
                        quests,
                    });
                }
            } else {
                View.render(req, res, 'pages/message', {
                    target,
                    class: "text-danger",
                    message: "Ce signalement ne peut pas être affiné."
                });
            }
        } else {
            View.render(req, res, 'pages/message', {
                target,
                class: "text-danger",
                message: "Ce signalement n'existe pas."
            });
        }

    }
}
