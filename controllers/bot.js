const TelegramBot = require('node-telegram-bot-api');
const StringBuilder = require("string-builder");
const BotLine = require('../models').BotLine;

const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];

const token = config.telegram.token;
const publicChatId = config.telegram.publicChatId;
const adminChatId = config.telegram.adminChatId;

const bot = token ? new TelegramBot(token, {polling: true}) : null;

if (bot){
    bot.sendMessage(adminChatId, "Démarrage du serveur\n_Version "+ process.env.npm_package_version +"_", { parse_mode: "Markdown" });
    bot.on('message', (msg) => {
    });
}

async function sendMessage(chat, kind, params) {
    if (bot) {
        var sentences = await BotLine.findAll({ where: { kind } });
        if( sentences.length > 0 ) {
            var row = sentences[Math.floor(Math.random()*sentences.length)];
            console.log(row.sentence, ...params);
            var sb = new StringBuilder();
            sb.appendFormat(row.sentence, ...params);
            bot.sendMessage(publicChatId, sb.toString(), { parse_mode: "Markdown" });
        }
    }
}

module.exports = {

    isActive: function() {
        return bot !== null;
    },

    sendPublicMessage: function(kind, params) {
        sendMessage(publicChatId, kind, params);
    },

    sendAdminMessage: function(kind, params) {
        sendMessage(adminChatId, kind, params);
    },
}
