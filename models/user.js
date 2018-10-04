var bcrypt = require('bcryptjs');

module.exports = (sequelize, type) => {
    var User = sequelize.define('User', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: { type: type.STRING, allowNull: false },
        role: { type: type.STRING, allowNull: true },
        password: { type: type.STRING, allowNull: false },
        credentials: { type: type.TINYINT, allowNull: false, defaultValue: 1 },
        privacy: { type: type.TINYINT, allowNull: false, defaultValue: 0 },
        scoreDay: { type: type.INTEGER, allowNull: false, defaultValue: 0 },
        scoreWeek: { type: type.INTEGER, allowNull: false, defaultValue: 0 },
        scoreMonth: { type: type.INTEGER, allowNull: false, defaultValue: 0 },
        scoreLife: { type: type.INTEGER, allowNull: false, defaultValue: 0 },
    });

    User.beforeCreate( async function(user) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
    });

    User.associate = function (models) {
        models.User.belongsTo(models.UserGroup, {
            onDelete: "SET NULL",
            foreignKey: {
                allowNull: true
            }
        });
        models.User.hasMany(models.Report);
    };

    User.prototype.checkPassword = async function(password) {
        return await bcrypt.compare(password, this.password);
    }

    return User;
}
