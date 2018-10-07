var createError = require('http-errors');
var express = require('express');
var flash = require('connect-flash');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var models = require('./models');
var config = require('./config/config.js');

var SequelizeStore = require('connect-session-sequelize')(session.Store);

var indexRouter = require('./routes/index');
var publicRouter = require('./routes/public');
var memberRouter = require('./routes/member');
var adminRouter = require('./routes/admin');

const env = process.env.NODE_ENV || 'development';

require('moment').tz.setDefault('Europe/Paris');
require('./scheduler').init('Europe/Paris');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Init session
app.use(session({
    secret: config[env].session.secret,
    store: new SequelizeStore({
        db: models.sequelize
    }),
    resave: false,
    saveUninitialized: false,
    proxy: true
}));

app.use(flash());

function checkAuth (req, res, next) {

    // CREDENTIALS
    // 0  : banned User
    // 1  : unverified User
    // 2  : verified basic User
    // 3+ : admin

    if (req.url.startsWith('/admin')) {
        if (!req.session.credentials) {
            return res.redirect('/login');
        } else if(req.session.credentials < 3) {
            return res.redirect('/credentials');
        }
    }

    if (req.url.startsWith('/member')) {
        if (!req.session.credentials) {
            req.session.origin = req.url;
            return res.redirect('/login');
        } else if(req.session.credentials < 2) {
            return res.redirect('/credentials');
        }
    }

    next();
}

app.use(checkAuth);
app.use('/', indexRouter);
app.use('/public', publicRouter);
app.use('/member', memberRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('pages/error');
});

models.sequelize.sync();

module.exports = app;
