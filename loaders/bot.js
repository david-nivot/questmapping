const request = require('request');
const csv = require('csvtojson');
const sequelize_fixtures = require('sequelize-fixtures');
const models = require('../models');

async function cleanBotLinesFromDB() {
    await models.BotLine.destroy({where: {}});
}

function processBotLineRow( row ) {
    sequelize_fixtures.loadFixture({ model: 'BotLine', data: row }, models);
}

request.get(process.argv[2], function (error, response, body) {
    if (!error && response.statusCode == 200) {
        csv({ignoreEmpty:true})
        .fromString(body)
        .then((json)=>{
            cleanBotLinesFromDB()
            .then(function() {
                json.forEach(processBotLineRow);
                process.exit();
            })
            .catch(function(error) {
                console.error(error);
                process.exit(1);
            });
        })
    }
    else {
        console.error("Failed to load bot lines");
    }
});
