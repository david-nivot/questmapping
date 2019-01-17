module.exports = (sequelize, type) => {
    var Stat = sequelize.define('Stat', {
        key: { type: type.STRING, primaryKey: true },
        value: { type: type.INTEGER, allowNull: false, defaultValue: 1 },
    }, {
        timestamps: false,
    });

    return Stat;
}
