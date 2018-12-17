module.exports = (sequelize, type) => {
    var BotLine = sequelize.define('BotHistory', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        kind: { type: type.STRING, allowNull: false },
        chatId: { type: type.INTEGER, allowNull: false },
        messageId: { type: type.INTEGER, allowNull: false },
    });

    return BotLine;
}
