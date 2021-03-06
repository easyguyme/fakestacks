/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs    :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
  tableName: 'users',

  schema: true,

  attributes: {
    firstName: {
      type: 'string',
      required: true
    },
    lastName: {
      type: 'string',
      required: true
    },
    email: {
      type: 'email',
      required: true,
      unique: true,
      confirmationmatch: true
    },
    league: {
      model: 'League'
    },
    admin: {
      type: 'boolean',
      defaultsTo: false
    },
    encryptedPassword: {
      type: 'string'
    },
    bets: {
      collection: 'Bet',
      via: 'user'
    },
    notifyprocessedbets: {
      type: 'boolean',
      defaultsTo: true
    },

    getFullName: function() {
      return this.firstName + " " + this.lastName;
    },

    toJSON: function () {
      var obj = this.toObject();
      delete obj.password;
      delete obj.confirmation;
      delete obj.encryptedPassword;
      delete obj._csrf;
      obj.fullName = this.getFullName();
      return obj;
    }

  },

  types: {
    confirmationmatch: function() {
      return this.password === this.confirmation;
    }
  },

  validationMessages: { //hand for i18n & l10n
    email: {
      required: 'Email is required',
      email: 'Provide valid email address',
      unique: 'This email address is already taken',
      confirmationmatch: 'Password does not match password confirmation' //This is a hack, but need this check to happen on password matches
    },
    firstName: {
      required: 'First name is required'
    },
    lastName: {
      required: 'Last name is required'
    }
  },

  beforeCreate: function(values, next) {
    delete values.id;
    values.email = values.email.toLowerCase();

    var encryptedPassword = require('password-hash').generate(values.password);
    values.encryptedPassword = encryptedPassword;
    next();
  },

  beforeUpdate: function(values, next) {
    if (!values.password_update) {
      return next();
    }

    var encryptedPassword = require('password-hash').generate(values.password);
    values.encryptedPassword = encryptedPassword;
    next();
  }

};
