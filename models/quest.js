module.exports = (sequelize, type) => {
    var Quest = sequelize.define('Quest', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        goal: { type: type.STRING, allowNull: false },
        reward: { type: type.STRING, allowNull: false },
        rarity: { type: type.TINYINT, defaultValue: 1 },
        visibility: { type: type.TINYINT, defaultValue: 1 },
        color: { type: type.STRING, allowNull: true },
    });

    Quest.associate = function (models) {
        models.Quest.belongsTo(models.QuestGroup, {
            onDelete: "SET NULL",
            foreignKey: {
                allowNull: true
            }
        });
        models.Quest.hasMany(models.Report);
    };

    return Quest;
}
