const request = require('request');
const csv = require('csvtojson');
const sequelize_fixtures = require('sequelize-fixtures');
const models = require('../models');

async function cleanQuestsFromDB() {
    await models.Quest.destroy({where: {}});
    await models.QuestGroup.destroy({where: {}});
}

async function processQuestRow( row ) {

    if(!row.goal) { // is QuestGroup
        await sequelize_fixtures.loadFixture({ model: 'QuestGroup', data: row }, models);
    } else { // is Quest
        var parent = row.QuestGroupId;
        if(row.icon) {
            var data = { id: row.id, name: row.reward, icon: row.icon, iconHD: row.iconHD, MapLayerId: row.MapLayerId, QuestGroupId: row.QuestGroupId, visibility: row.visibility };
            parent = row.id;
            await sequelize_fixtures.loadFixture({ model: 'QuestGroup', data }, models);
        }
        var data = { id: row.id, goal: row.goal, reward: row.reward, rarity: row.rarity, QuestGroupId: parent, visibility: row.visibility };
        await sequelize_fixtures.loadFixture({ model: 'Quest', data }, models);
    }

}

request.get(process.argv[2], function (error, response, body) {
    if (!error && response.statusCode == 200) {
        csv({ignoreEmpty:true})
        .fromString(body)
        .then((json)=>{
            cleanQuestsFromDB()
            .then(function() {
                json.forEach(processQuestRow);
            })
            .catch(function(error) {
                console.error(error);
            });
        })
    }
    else {
        console.error("Failed to load quests");
    }
});
