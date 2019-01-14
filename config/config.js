require('dotenv').config();

module.exports = {
    timezone: process.env.APP_TIMEZONE,
    frontUrl: process.env.FRONT_URL,
    contact: process.env.CONTACT,
    imgProvider: process.env.IMG_PROVIDER,
    db: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOSTNAME,
        port:process.env.DB_PORT,
        dialect: 'mysql',
        timezone: process.env.APP_TIMEZONE,
        logging: process.env.NODE_ENV === 'production' ? false : console.log,
    },
    session: {
        secret: process.env.SESSION_SECRET,
    },
    telegram: {
        token: process.env.TELEGRAM_TOKEN,
        publicChatId: process.env.TELEGRAM_PUBLIC_CHAT_ID,
        adminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID,
        minQuestRarity: 4,
    },
    datasource: {
        bot: process.env.DATASOURCE_BOT,
        poi: process.env.DATASOURCE_POI,
        quest: process.env.DATASOURCE_QUEST,
    }
};
