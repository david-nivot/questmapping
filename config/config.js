module.exports = {
    development: {
        frontUrl: "http://127.0.0.1/",
        imgProvider: "https://drive.google.com/uc?id={{ID}}",
        db: {
            username: "root",
            password: "",
            database: "questmapping",
            host: "127.0.0.1",
            port:"3306",
            dialect: 'mysql',
            timezone: 'Europe/Paris',
        },
        session: {
            secret: "shiny unicorn"
        }
    },
    production: {
        frontUrl: process.env.FRONT_URL,
        imgProvider: process.env.IMG_PROVIDER,
        db: {
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            host: process.env.DB_HOSTNAME,
            port:process.env.DB_PORT,
            dialect: 'mysql',
            timezone: 'Europe/Paris',
        },
        session: {
            secret: process.env.SESSION_SECRET
        }
    }
};
