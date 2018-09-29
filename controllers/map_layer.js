const moment = require('moment');
const StringBuilder = require("string-builder");
const sequelize = require('../models').sequelize;
const Poi = require('../models').Poi;
const Report = require('../models').Report;
const Quest = require('../models').Quest;
const QuestGroup = require('../models').QuestGroup;

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
            if(pois.length === 0) {
                sb.appendLine("0;0;Aucune;");
            }
            pois.forEach( poi => {
                sb.appendLine();
                sb.appendFormat(
                    "{0};{1};{2};[[{3}|Editer]]",
                    poi.latitude,
                    poi.longitude,
                    poi.name,
                    req.protocol + '://' + req.get('host') + "/member/poi/" + poi.id,
                );
            })
            res.setHeader('Content-disposition', 'attachment; filename=map.csv');
            res.set('Content-Type', 'text/csv');
            res.status(200).send(sb.toString());
        });
    },

    getLayer(req, res) {
        Poi.findAll({
            include: {
                model: Report,
                attributes: ["id", "createdAt"],
                where: { ShadowId: { $eq: null } },
                include: {
                    model: Quest,
                    required: true,
                    attributes: ['goal', 'reward'],
                    include: {
                        model: QuestGroup,
                        attributes: ['icon'],
                        where: { MapLayerId: req.params.id },
                    }
                }
            },
            attributes: ['name', 'latitude', 'longitude']
        }).then(pois => {
            let sb = new StringBuilder();
            sb.append("lat;long;name;description;icon");
            if(pois.length === 0) {
                sb.appendLine("0;0;Aucune;;");
            }
            pois.forEach( poi => {
                sb.appendLine();
                sb.appendFormat("{0};{1};{2};",
                    poi.latitude,
                    poi.longitude,
                    poi.name,
                );
                sb.appendFormat(
                    '"Objectif: **{0}**\nRécompense: **{1}**\n*Le {2}*\n\n[[{3}|Signaler erreur]]";',
                    poi.Reports[0].Quest.goal,
                    poi.Reports[0].Quest.reward,
                    moment(poi.Reports[0].createdAt).format("DD/MM à HH:mm"),
                    req.protocol + '://' + req.get('host') + "/member/report/" + poi.Reports[0].id,
                );
                sb.append(poi.Reports[0].Quest.QuestGroup.icon);
            })
            res.setHeader('Content-disposition', 'attachment; filename=map.csv');
            res.set('Content-Type', 'text/csv');
            res.status(200).send(sb.toString());
        });
    },

}
