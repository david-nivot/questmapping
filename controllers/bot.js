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

async function sendSpecialMessage(chat, kind, params=[]) {
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

async function sendTextMessage(message) {
    if (bot) {
        await bot.sendMessage(publicChatId, message, { parse_mode: "Markdown" });
    }
}

var self = module.exports = {

    isActive: function() {
        return bot !== null;
    },

    getMessages: async function() {
        return await BotLine.findAll({ attributes: [ 'kind' ], group: 'kind', order: [[ 'kind' ]] });
    },

    sendPublicMessage: function(kind, params) {
        sendSpecialMessage(publicChatId, kind, params);
    },

    sendAdminMessage: function(kind, params) {
        sendSpecialMessage(adminChatId, kind, params);
    },

    createMessage: function(req, res) {
        if (req.body.kind !== undefined) {
            self.sendPublicMessage(req.body.kind);
        } else if (req.body.text !== undefined) {
            sendTextMessage(req.body.text);
        }
        res.redirect('/admin');
    }
}
