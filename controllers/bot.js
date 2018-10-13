const TelegramBot = require('node-telegram-bot-api');
const StringBuilder = require("string-builder");
const BotLine = require('../models').BotLine;

const config = require(__dirname + '/../config/config.js');

const token = config.telegram.token;
const publicChatId = config.telegram.publicChatId;
const adminChatId = config.telegram.adminChatId;

const bot = token ? new TelegramBot(token, {polling: true}) : null;

if (bot){
    bot.sendMessage(
        adminChatId,
        "Démarrage du serveur\n_Version "+ process.env.npm_package_version +"_",
        { parse_mode: "Markdown" }
    );
    bot.on('message', (msg) => {
    });
}

async function sendMessage(chat, kind, params=[]) {
    if (bot) {
        var sentences = await BotLine.findAll({ where: { kind } });
        if( sentences.length > 0 ) {
            var row = sentences[Math.floor(Math.random()*sentences.length)];
            var sb = new StringBuilder();
            sb.appendFormat(row.sentence, ...params);
            await bot.sendMessage(chat, sb.toString(), { parse_mode: "Markdown" });
        }
    }
}

module.exports = {

    isActive: function() {
        return bot !== null;
    },

    sayHello: async function(req, res) {
        await sendMessage(publicChatId, "SayWelcome#1#1");
        await sendMessage(publicChatId, "SayWelcome#1#2");
        await sendMessage(publicChatId, "SayWelcome#1#3");
        return res.redirect('/admin');
    },

    sendPublicMessage: function(kind, params) {
        sendMessage(publicChatId, kind, params);
    },

    sendAdminMessage: function(kind, params) {
        sendMessage(adminChatId, kind, params);
    },
}
