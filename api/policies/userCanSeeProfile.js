/**
 * Allow a logged-in user to see, edit and update her own profile
 * Allow admins to see everyone
 */

module.exports = function(req, res, ok) {

	if (req.session.User == null) {
		res.redirect('/login');
    	return;
	}
	var sessionUserMatchesId = (req.session.User.id == req.param('id'));
	var isAdmin = req.session.User.admin;

	// The requested id does not match the user's id,
	// and this is not an admin
	if (!(sessionUserMatchesId || isAdmin)) {
		var noRightsError = [{name: 'noRights', message: 'You do not have permissions to access this page'}]
		req.session.flash = {
			err: noRightsError
		}
    	res.redirect('/login');
    	return;
	}

	ok();

};
