const cookieParser = require('cookie-parser');
const session = require('express-session');

module.exports = function(app, express){
	app.use(express.urlencoded({extended: true}));
	app.use(function(req, res, next) {
	  res.header("Access-Control-Allow-Origin", "*");
	  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	  next();
	});

	app.use(express.json());

	app.use(cookieParser());

	app.use(session({
	    secret: Number(Math.random()).toString(36).split('.')[1],
	    resave: false,
	    saveUninitialized: true
	}));

	app.use(express.static(__dirname + "/../public"));
}