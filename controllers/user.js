const User = require('../models').User;
const UserGroup = require('../models').UserGroup;

module.exports = {

    login(req, res) {
        res.locals = {
            flash: req.flash('error')
        }
        res.render('pages/login', { partials: {head: 'partials/head'} });
    },

    doLogin(req, res) {
        User.findOne({ where: { name: req.body.login } }).then(async function (user) {
            if (!user || !await user.checkPassword(req.body.password)) {
                req.flash('error', 'Identifiant ou mot de passe incorrect.');
                res.redirect('/login');
            } else {
                req.session.userid = user.id;
                req.session.username = user.name;
                req.session.credentials = user.credentials;
                res.redirect(req.session.origin || "/");
            }
        });
    },

    async register(req, res) {
        var groups = await UserGroup.findAll();
        res.locals = {
            groups,
            flash: req.flash('error')
        }
        res.render('pages/register', { partials: {head: 'partials/head'} });
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
        .spread(function(user, created) {
            if(!created) {
                req.flash('error', 'Cet utilisateur existe déjà.');
                res.redirect('/register');
            } else {
                req.session.userid = user.id;
                req.session.username = user.name;
                req.session.credentials = user.credentials;
                res.redirect(req.session.origin || "/");
            }
        })
    },

}
