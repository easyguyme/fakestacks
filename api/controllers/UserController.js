/**
 * UserController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
    
  
	'new': function (req, res) {
		res.view();
	},

	create: function (req, res, next) {
		var user = req.params.all();
		user.admin = req.session.emptyLeague ? true : false;
		User.create( user, function userCreated (err, user) {
			req.session.emptyLeague = false;
			if (err) {
				console.log(err);
				req.session.flash = {
					err: err
				}

				return res.redirect('/user/new');
			}
			newAccountTransaction = {
				user: user,
				amount: 500,
				bet: null
			};
			Transaction.create(newAccountTransaction, function accountCreated(err, account) {
				if (err) {
					console.log(err);
					req.session.flash = {
						err: err
					}

					return res.redirect('/user/new');
				}
				res.redirect('/user/show/'+user.id);
			});
		});
	},

	show: function(req, res, next) {
		User.findOne(req.param('id'), function foundUser(err, user) {
			if (err) return next(err);
			if (!user) return next();
			res.view({
				user: user
			});
		});
	},

	edit: function(req, res, next) {
		User.findOne(req.param('id'), function foundUser(err, user) {
			if (err) return next(err);
			if (!user) return next();
			res.view({
				user: user
			});
		});
	},

	password: function(req, res, next) {
		User.findOne(req.param('id'), function foundUser(err, user) {
			if (err) return next(err);
			if (!user) return next();
			res.view({
				user: user
			});
		});
	},

	updatepass: function(req, res, next) {
		var user = req.params.all();
		user.password_update = true;
		User.update(req.param('id'), req.params.all(), function updatedPassword(err) {
			if (err) {
				req.session.flash = {
					err: err
				}
				return res.redirect('/user/password/' + req.param('id'));
			}
			res.redirect('/user/show/' + req.param('id'));
		});
	},

	destroy: function(req, res, next) {
		User.findOne(req.param('id'), function foundUser(err, user) {
			if (err) return next(err);
			if (!user) return next('User doesn\'t exist');
			User.destroy(req.param('id'), function deleteUser(err) {
				if (err) return next(err);
			});
			res.redirect('/user');
		});
	},

	update: function(req, res, next) {
		User.update(req.param('id'), req.params.all(), function userUpdated(err) {
			if (err) return res.redirect('/user/edit/' + req.param('id'));
			res.redirect('/user/show/' + req.param('id'));
		});
	},

	index: function(req, res, next) {
		User.find().populate('bets').exec(function foundUsers(err, users) {
			if (err) return next(err);
			var totalMoney = 0;
			var totalWins = 0;
			var totalLosses = 0;
			var totalPushes = 0;
			for (var i=0; i<users.length; i++) {
				var tallies = BetService.getBetTallies(users[i].bets);
				for (var prop in tallies) {
					users[i][prop]=tallies[prop];
				}
				totalMoney += users[i].money;
				totalWins += users[i].wins;
				totalLosses += users[i].losses;
				totalPushes += users[i].pushes;
			}
			users.sort(function(user1, user2){return (user2.money-user1.money==0) ? (user2.wins-user1.wins) : (user2.money-user1.money)});
			res.view({
				users: users,
				totalMoney: totalMoney,
				totalRecord: totalWins+"-"+totalLosses+"-"+totalPushes
			});
		});
	},

  _config: {}

  
};
