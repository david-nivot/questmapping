const request = require('request');
const csv = require('csvtojson');
const sequelize_fixtures = require('sequelize-fixtures');
const models = require('../models');

async function cleanPoiFromDB() {
    await models.Poi.destroy({where: {}});
}

function processPoiRow( row ) {
    sequelize_fixtures.loadFixture({ model: 'Poi', data: row }, models);
}

request.get(process.argv[2], function (error, response, body) {
    if (!error && response.statusCode == 200) {
        csv({ignoreEmpty:true, delimiter:"|"})
        .fromString(body)
        .then((json)=>{
            cleanPoiFromDB()
            .then(function() {
                json.forEach(processPoiRow);
                process.exit();
            })
            .catch(function(error) {
                console.error(error);
                process.exit(1);
            });
        })
    }
    else {
        console.error("Failed to load poi");
    }
});
