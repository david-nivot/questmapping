module.exports = (sequelize, type) => {
    var Report = sequelize.define('Report', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }
    });

    Report.associate = function (models) {
        models.Report.belongsTo(models.Poi, {
            onDelete: "CASCADE",
            foreignKey: {
                allowNull: false
            }
        });
        models.Report.belongsTo(models.Quest, {
            onDelete: "CASCADE",
            foreignKey: {
                allowNull: false
            }
        });
        models.Report.belongsTo(models.User, {
            onDelete: "SET NULL",
            foreignKey: {
                allowNull: true
            }
        });
        models.Report.belongsTo(models.User, {
            onDelete: "SET NULL",
            as: 'Editor',
            foreignKey: {
                allowNull: true
            }
        });
    };

    return Report;
}
