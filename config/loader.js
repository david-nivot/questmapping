const request = require('request');
const csv = require('csvtojson');
const bot = require("../controllers/bot");
const sequelize_fixtures = require('sequelize-fixtures');
const models = require('../models');
const datasource = require(__dirname + '/../config/config.js').datasource;

async function loadData(modelName, src, delimiter=",") {

    await request.get(src, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            csv({ignoreEmpty:true, delimiter})
            .fromString(body)
            .then(async (json) => {
                await models[modelName].destroy({where: {}});
                json.forEach(async (row) => {
                    await sequelize_fixtures.loadFixture({ model: modelName, data: row }, models);
                });
                bot.sendAdminMessage(modelName + " updated. Row count: " + json.length);
                return true;
            })
        } else {
            return false;
        }
    });

}

async function loadQuestData(src) {

    await request.get(src, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            csv({ignoreEmpty:true})
            .fromString(body)
            .then(async (json) => {
                await models.Quest.destroy({where: {}});
                await models.QuestGroup.destroy({where: {}});
                json.forEach(async (row) => {
                    if(!row.goal) { // is QuestGroup
                        await sequelize_fixtures.loadFixture({ model: 'QuestGroup', data: row }, models);
                    } else { // is Quest
                        var parent = row.QuestGroupId;
                        if(row.icon) {
                            var data = { id: row.id, name: row.reward, icon: row.icon, iconHD: row.iconHD, MapLayerId: row.MapLayerId, QuestGroupId: row.QuestGroupId };
                            parent = row.id;
                            await sequelize_fixtures.loadFixture({ model: 'QuestGroup', data }, models);
                        }
                        var data = { id: row.id, goal: row.goal, reward: row.reward, rarity: row.rarity, QuestGroupId: parent };
                        await sequelize_fixtures.loadFixture({ model: 'Quest', data }, models);
                    }
                });
                bot.sendAdminMessage("Quests updated. Row count: " + json.length);
                return true;
            })
        } else {
            return false;
        }
    });

}

module.exports = {
    loadBotLines: function(req, res){
        loadData("BotLine", datasource.bot);
        res.redirect('/admin');
    },
    loadPois: function(req, res){
        loadData("Poi", datasource.poi, "|");
        res.redirect('/admin');
    },
    loadQuests: function(req, res){
        loadQuestData(datasource.quest);
        res.redirect('/admin');
    }
};
