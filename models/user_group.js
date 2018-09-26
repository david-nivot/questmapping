module.exports = (sequelize, type) => {
    var UserGroup = sequelize.define('UserGroup', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: { type: type.STRING, allowNull: false },
        color: { type: type.STRING, allowNull: false }
    });

    UserGroup.associate = function (models) {
        models.UserGroup.hasMany(models.User);
    };

    return UserGroup;
}
