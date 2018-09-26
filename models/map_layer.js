module.exports = (sequelize, type) => {

    var MapLayer = sequelize.define('MapLayer', {
        id: {
            type: type.STRING,
            primaryKey: true
        },
        name: type.STRING
    });

    MapLayer.associate = function (models) {
        models.MapLayer.hasMany(models.QuestGroup);
    };

    return MapLayer;

}
