const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];

const partials = {
    head: 'partials/head',
    header: 'partials/header',
    footer: 'partials/footer',
};

module.exports = {

    render(req, res, page, locals) {
        res.locals = locals;
        res.locals.contact = config.contact;
        res.locals.frontUrl = config.frontUrl;
        res.locals.user = req.session && {
            name: req.session.username,
            color: req.session.usercolor,
        }
        res.render(page, { partials });
    },

}
