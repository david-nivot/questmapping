const StringBuilder = require("string-builder");
const sequelize = require('../models').sequelize;
const Poi = require('../models').Poi;
const Report = require('../models').Report;

module.exports = {

    getDefaultLayer(req, res) {
        Poi.findAll({
            include: {
                model: Report,
                required: false,
                attributes: []
            },
            where: sequelize.where(
                sequelize.col('Reports.PoiId'),
                'IS',
                null
            )
        }).then(pois => {
            let sb = new StringBuilder();
            sb.append("lat;long;name;description");
            pois.forEach( poi => {
                sb.appendLine();
                sb.appendFormat(
                    "{0};{1};{2};[[{3}|Editer]]",
                    poi.latitude,
                    poi.longitude,
                    poi.name,
                    req.protocol + '://' + req.get('host') + "/public/poi/" + poi.id,
                );
            })
            res.setHeader('Content-disposition', 'attachment; filename=map.csv');
            res.set('Content-Type', 'text/csv');
            res.status(200).send(sb.toString());
        });
    },

    getLayer(req, res) {
        //TODO
    },

}
