/**
 * BetController
 *
 * @description :: Server-side logic for managing bets
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	create: function (req, res, next) {
		var confirmedBets = req.session.cart;
		var createdBets = 0;
		if (req.session.User == null) {
			res.redirect('/session/new');
		}
		
		ValidationService.validateBets(req, confirmedBets, function(errors) {
			console.log("Callback errors: " + errors);
			if (errors.length > 0) {
		      	req.session.flash = {
					err: errors
				}
				return res.redirect('/confirmation');
		    }

			for (var i=0; i<confirmedBets.length; i++) {
				var bet = confirmedBets[i];
				bet.bettable = bet.bettable;
				bet.user = req.session.User;
				bet.time = new Date();
				Bet.create( bet, function betCreated(err, createdBet) {
					if (err) {
						console.log(err);
						req.session.flash = {
							err: err
						}
						return res.redirect('/bettable');
					}
					transaction = {
						user: req.session.User,
						amount: 0-parseInt(createdBet.amount),
						bet: createdBet,
						bettable: createdBet.bettable
					};
					Transaction.create(transaction, function transactionCreated(err, createdTransaction) {
						if (err) {
							console.log(err);
							req.session.flash = {
								err: err
							}
							return res.redirect('/bettable');
						}
						console.log("Bet Created!");
						createdBets++;
						req.session.User.money += createdTransaction.amount;
						if (createdBets == req.session.cart.length) {
							req.session.cart = [];
							res.redirect('/bettable');
						}
					});
				});
	    	}
		});
	},

	update: function(req, res, next) {
		Bet.update(req.param('id'), req.params.all(), function betUpdated(err, updatedBets) {
			if (err) {
				console.log("BET UPDATE FAILED: " + err);
				return res.badRequest();
			}
			var bet = updatedBets[0];
			if (bet.win === true) {
				console.log("Logging winning transaction");
				transaction = {
					user: req.session.User,
					amount: 2*parseInt(bet.amount),
					bet: bet,
					bettable: bet.bettable
				};
				Transaction.create(transaction, function transactionCreated(err, createdTransaction) {
					if (err) {
						console.log(err);
						req.session.flash = {
							err: err
						}
						console.log("TRANSACTION UPDATE FAILED: " + err);
						return res.badRequest();
					}
					return res.ok();
				});
			}
			else if (bet.win == null) {
				console.log("Logging push transaction");
				transaction = {
					user: bet.user,
					amount: parseInt(bet.amount),
					bet: bet,
					bettable: bet.bettable
				};
				Transaction.create(transaction, function transactionCreated(err, createdTransaction) {
					if (err) {
						console.log(err);
						req.session.flash = {
							err: err
						}
						console.log("TRANSACTION UPDATE FAILED: " + err);
						return res.badRequest();
					}
					return res.ok();
				});
			}
			else {
				console.log("Logging losing transaction");
				return res.ok();
			}
		});
	},

	index: function(req, res, next) {
		Bet.find().where({complete:false}).populate('bettable').populate('user').sort('user DESC').exec(function(err,bets) {
			var betsByUser = {};
			for (var i=0; i<bets.length; i++) {
				if (!betsByUser[bets[i].user.id]) {
					betsByUser[bets[i].user.id] = [];
				}
				betsByUser[bets[i].user.id].push(bets[i]);
			}
			res.view({
				betsByUser: betsByUser
			});
		});
	},

	_config: {}
	
};

