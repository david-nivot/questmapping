const User = require('../models').User;
const UserGroup = require('../models').UserGroup;
const View = require('../views');

async function saveUserOnSession(req, user) {
    var group = await UserGroup.findOne({ where: { id: user.UserGroupId } });
    req.session.userid = user.id;
    req.session.username = user.name;
    req.session.credentials = user.credentials; //TODO Refresh creds from DB
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
                res.redirect(req.session.origin || "/");
            }
        })
    },

}
