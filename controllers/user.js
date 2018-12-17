const moment = require('moment');
const User = require('../models').User;
const UserGroup = require('../models').UserGroup;
const View = require('../views');
const bot = require("./bot");

async function saveUserOnSession(req, user) {
    var group = await UserGroup.findOne({ where: { id: user.UserGroupId } });
    req.session.userid = user.id;
    req.session.username = user.name;
    req.session.credentials = user.credentials;
    req.session.usercolor = group.color;
}

module.exports = {

    login(req, res) {
        View.render(req, res, 'pages/login', {
            flash: req.flash('error')
        });
    },

    doLogin(req, res) {
        User.findOne({ where: { name: req.body.login } }).then(async function (user) {
            if (!user || !await user.checkPassword(req.body.password)) {
                req.flash('error', 'Identifiant ou mot de passe incorrect.');
                res.redirect('/login');
            } else {
                await saveUserOnSession(req, user);
                res.redirect(req.session.origin || "/");
            }
        });
    },

    logout(req, res) {
        req.session.destroy( (err) => {
            return res.redirect('/login');
        });
    },

    async register(req, res) {
        var groups = await UserGroup.findAll();
        View.render(req, res, 'pages/register', {
            groups,
            flash: req.flash('error')
        });
    },

    doRegister(req, res) {
        if(req.body.login.length === 0) {
            req.flash('error', 'Veuillez saisir un pseudo.');
            return res.redirect('/register');
        }
        if(req.body.password.length === 0) {
            req.flash('error', 'Veuillez saisir un mot de passe.');
            return res.redirect('/register');
        }
        if(req.body.group === undefined) {
            req.flash('error', 'Veuillez sélectionner une équipe.');
            return res.redirect('/register');
        }

        User
        .findOrCreate({
            where: { name: req.body.login },
            defaults: { password: req.body.password, UserGroupId: req.body.group }
        })
        .spread(async function(user, created) {
            if(!created) {
                req.flash('error', 'Cet utilisateur existe déjà.');
                res.redirect('/register');
            } else {
                await saveUserOnSession(req, user);
                bot.sendAdminLine("NewUser", [user.name]);
                res.redirect(req.session.origin || "/");
            }
        })
    },

    async refreshCredentials(req, res) {
        if( req.session.userid ) {
            var user = await User.findOne({
                where: { id: req.session.userid }
            });
            req.session.credentials = user.credentials;
        }

    },

    async getAdminList(req, res) {
        return await User.findAll({
            where: { credentials: { $gte: 3 } },
            order: [ 'name' ],
        });
    },

    async getPendingUsers(req, res) {
        var users = await User.findAll({
            where: { credentials: { $eq: 1 } },
            include: [UserGroup],
            order: [ ['createdAt', 'DESC'] ],
        });

        users = users.map( u => {
            return {
                userid: u.id,
                username: u.name,
                usercolor: u.UserGroup.color,
                createdAt: moment(u.createdAt).format("DD/MM à HH:mm"),
                value: 2 //credentials value
            }
        });

        View.render(req, res, 'pages/admin/users', {
            title: "Autorisation des utilisateurs",
            actionLabel: "Autoriser",
            actionValue: "credentials",
            users,
        });
    },

    async getBannedUsers(req, res) {
        var users = await User.findAll({
            where: { credentials: { $eq: 0 } },
            include: [UserGroup],
            order: [ ['createdAt', 'DESC'] ],
        });

        users = users.map( u => {
            return {
                userid: u.id,
                username: u.name,
                usercolor: u.UserGroup.color,
                createdAt: moment(u.createdAt).format("DD/MM à HH:mm"),
                value: 2 //credentials value
            }
        });

        View.render(req, res, 'pages/admin/users', {
            title: "Débannir un utilisateur",
            actionLabel: "Débannir",
            actionValue: "credentials",
            users,
        });
    },

    async updateUser(req, res) {
        if (req.body.credentials !== undefined) {
            var user = await User.findOne({
                where: { id: req.params.id },
            });
            if (user) {
                if (user.credentials >= req.session.credentials) {
                    return View.render(req, res, 'pages/message', {
                        class: "text-danger",
                        message: "Droits insuffisants pour éditer cet utilisateur."
                    });
                } else {
                    await user.update({ credentials: req.body.credentials });
                    bot.sendAdminLine("UserCredentialsUpdated", [user.name, req.session.username, req.body.credentials]);
                }
            } else {
                return View.render(req, res, 'pages/message', {
                    class: "text-danger",
                    message: "Utilisateur inexistant.",
                });
            }
        }
        res.redirect(req.header('Referer') || '/admin');
    },

}
