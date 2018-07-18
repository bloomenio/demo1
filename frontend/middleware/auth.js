const request = require('request-promise');


module.exports = function(req, res, next){
	if(req.session.token){
		
		next();
	} else {
		res.sendStatus(401);
	}
}