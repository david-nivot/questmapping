const request = require('request');
const csv = require('csvtojson');
const sequelize_fixtures = require('sequelize-fixtures');
const models = require('../models');

async function cleanFromDB() {
    await models.UserGroup.destroy({where: {}});
}

function processRow( row ) {
    sequelize_fixtures.loadFixture({ model: 'UserGroup', data: row }, models);
}

request.get(process.argv[2], function (error, response, body) {
    if (!error && response.statusCode == 200) {
        csv({ignoreEmpty:true})
        .fromString(body)
        .then((json)=>{
            cleanFromDB()
            .then(function() {
                json.forEach(processRow);
                process.exit();
            })
            .catch(function(error) {
                console.error(error);
                process.exit(1);
            });
        })
    }
    else {
        console.error("Failed to load user groups.");
    }
});
