var bcrypt = require('bcryptjs');

module.exports = (sequelize, type) => {
    var BotLine = sequelize.define('BotLine', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        kind: { type: type.STRING, allowNull: false },
        sentence: { type: type.STRING, allowNull: false },
    });

    return BotLine;
}
