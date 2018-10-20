var UserController = require('../controllers/user');

async function checkInvalidCredentials(req, res, level) {

    if( req.session.credentials < level ) {
        await UserController.refreshCredentials(req, res);
        if( req.session.credentials < level ) {
            return true;
        }
    }
    return false;
}
module.exports = {

    async checkAuth(req, res, next) {

        // CREDENTIALS
        // 0  : banned User
        // 1  : unverified User
        // 2  : verified basic User
        // 3+ : admin

        if (req.url !== "/suspended" && req.session.userid && await checkInvalidCredentials(req, res, 1)) {
            return res.redirect('/suspended');
        }

        if (req.url.startsWith('/admin')) {
            if (!req.session.userid) {
                return res.redirect('/login');
            } else if(await checkInvalidCredentials(req, res, 3)) {
                return res.redirect('/credentials');
            }
        }

        if (req.url.startsWith('/member')) {
            if (!req.session.userid) {
                req.session.origin = req.url;
                return res.redirect('/login');
            } else if(await checkInvalidCredentials(req, res, 2)) {
                return res.redirect('/credentials');
            }
        }

        next();
    },

    authorize( cb, minCredentials ) {
        return async (req, res, next) => {
            if (await checkInvalidCredentials(req, res, minCredentials)) {
                return res.redirect('/credentials');
            } else {
                return await cb(req, res, next);
            }
        }
    }
}
