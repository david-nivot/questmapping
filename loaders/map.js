const request = require('request');
const csv = require('csvtojson');
const sequelize_fixtures = require('sequelize-fixtures');
const models = require('../models');

async function cleanMapFromDB() {
    await models.MapLayer.destroy({where: {}});
}

function processMapLayerRow( row ) {
    sequelize_fixtures.loadFixture({ model: 'MapLayer', data: row }, models);
}

request.get(process.argv[2], function (error, response, body) {
    if (!error && response.statusCode == 200) {
        csv({ignoreEmpty:true})
        .fromString(body)
        .then((json)=>{
            cleanMapFromDB()
            .then(function() {
                json.forEach(processMapLayerRow);
            })
            .catch(function(error) {
                console.error(error);
            });
        })
    }
    else {
        console.error("Failed to load map layers");
    }
});
