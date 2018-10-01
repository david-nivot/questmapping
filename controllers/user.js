const User = require('../models').User;

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

    register(req, res) {
        res.locals = {
            flash: req.flash('error')
        }
        res.render('pages/register', { partials: {head: 'partials/head'} });
    },

    doRegister(req, res) {
        User
        .findOrCreate({
            where: { name: req.body.login },
            defaults: { password: req.body.password }
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
