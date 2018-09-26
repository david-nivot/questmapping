module.exports = (sequelize, type) => {
    var Poi = sequelize.define('Poi', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: { type: type.STRING, allowNull: false },
        latitude: { type: type.DECIMAL(10, 8), allowNull: false },
        longitude: { type: type.DECIMAL(11, 8), allowNull: false }
    });

    Poi.associate = function (models) {
        models.Poi.hasMany(models.Report);
    };

    return Poi;
}
