module.exports = (sequelize, type) => {
    var QuestGroup = sequelize.define('QuestGroup', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: { type: type.STRING, allowNull: false },
        icon: { type: type.STRING, allowNull: false },
        iconHD: { type: type.STRING, allowNull: true },
        isRoot: { type: type.BOOLEAN, allowNull: false, defaultValue: false },
        visibility: { type: type.TINYINT, defaultValue: 1 },
        color: { type: type.STRING, allowNull: true },
    })

    QuestGroup.associate = function (models) {
        models.QuestGroup.belongsTo(models.QuestGroup, {
            onDelete: "SET NULL",
            foreignKey: {
                allowNull: true
            }
        });
        models.QuestGroup.belongsTo(models.MapLayer, {
            onDelete: "SET NULL",
            foreignKey: {
                allowNull: true
            }
        });
        models.QuestGroup.hasMany(models.QuestGroup);
        models.QuestGroup.hasMany(models.Quest);
    };

    return QuestGroup;
}
