/**
 * BettableController
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
    
  create: function (req, res, next) {
  		//var express = require('express');
		var fs = require('fs');
		var request = require('request');
		var cheerio = require('cheerio');
		//var app     = express();
    
    	url = 'http://topbet.eu/sportsbook/college-football/ncaa';

	    request (url, function(error, response, html) {
	        if(!error){
	        	var $ = cheerio.load(html);

	            $('#events').filter(function(){

		           	var data = $(this);

		           	var games = data.find(".event");
		           	var gamesCount = games.length;

				    for (var i=0; i<gamesCount; i++) {
						var gameKey = games.eq(i).attr("id");
						var sideId1 = games.eq(i).find(".row0 .rotation_number").contents().last().text().trim();
						var sideId2 = games.eq(i).find(".row1 .rotation_number").contents().last().text().trim();
						var gameTime = games.eq(i).find("h3 span").text();
						var team1 = games.eq(i).find(".row0 .name").text().trim();
						var team2 = games.eq(i).find(".row1 .name").text().trim();
						var spread1 = games.eq(i).find(".row0 .spread").text();
						var spread2 = games.eq(i).find(".row1 .spread").text();
						if (spread1 != null && spread1.trim().length !== 0) {
							var bettable = {};
							bettable.gameKey = gameKey;
							bettable.gameTime = gameTime;
							bettable.team1 = team1;
							bettable.team2 = team2;
							bettable.sideId1 = sideId1;
							bettable.sideId2 = sideId2;
							bettable.team1Spread = spread1;
							bettable.team2Spread = spread2;
							Bettable.updateOrCreate(gameKey, bettable);
				    	}
				    }
				    res.redirect('/bettable');
	            })
	        }
	    });
	},

	index: function(req, res, next) {
		Bettable.find(function foundBettables(err, bettables) {
			if (err) return next(err);
			if (!req.session.cart) {
				req.session.cart = [];
			}
			var total = 0
			for (var i=0; i<req.session.cart.length; i++) {
				total += parseInt(req.session.cart[i].amount);
			}
			res.view({
				bettables: bettables,
				potentialBets: req.session.cart,
				totalAmount: total
			});
		});
	},

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to BettableController)
   */
  _config: {}

  
};
