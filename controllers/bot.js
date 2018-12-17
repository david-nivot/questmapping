const TelegramBot = require('node-telegram-bot-api');
const StringBuilder = require("string-builder");
const BotLine = require('../models').BotLine;
const BotHistory = require('../models').BotHistory;

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

async function sendLine(chatId, kind, params=[], save) {
    if (bot) {
        var sentences = await BotLine.findAll({ where: { kind } });
        if( sentences.length > 0 ) {
            var row = sentences[Math.floor(Math.random()*sentences.length)];
            var sb = new StringBuilder();
            sb.appendFormat(row.sentence, ...params);
            var message = await bot.sendMessage(chatId, sb.toString(), { parse_mode: "Markdown" });
            if( save ) {
                await BotHistory.create({ kind, chatId, messageId: message.message_id });
            }
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

    getLines: async function() {
        return await BotLine.findAll({ attributes: [ 'kind' ], group: 'kind', order: [[ 'kind' ]] });
    },

    sendQuestLine: function(line, params, save) {
        sendLine(publicChatId, line, params, save);
    },

    sendAdminLine: function(line, params) {
        sendLine(adminChatId, line, params, false);
    },

    removeMessages: async function(kind) {
        if(bot) {
            var messages = await BotHistory.findAll({ where: { kind } });
            messages.forEach( async m => {
                try {
                    await bot.deleteMessage(m.chatId, m.messageId);
                } catch (e) {
                } finally {
                    m.destroy();
                }
            });
        }
    },

    createMessage: function(req, res) {
        if (req.body.kind !== undefined) {
            self.sendQuestLine(req.body.kind, {}, true);
        } else if (req.body.text !== undefined) {
            sendTextMessage(req.body.text);
        }
        res.redirect('/admin');
    }
}
