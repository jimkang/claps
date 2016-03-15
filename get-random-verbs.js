var config = require('./config/config');
var createWordnok = require('wordnok').createWordnok;
var async = require('async');
var probable = require('probable');

var wordnok = createWordnok({
  apiKey: config.wordnikAPIKey
});

function getRandomVerbs(done) {
  var randomWordsOpts = {
    customParams: {
      includePartOfSpeech: 'verb',
      minLength: 2
    }
  };

  wordnok.getRandomWords(randomWordsOpts, filterTenses);

  function filterTenses(error, words) {
    if (error) {
      done(error);
    }
    else if (!words || words.length < 1) {
      wordnok.getRandomWords(randomWordsOpts, filterTenses);
    }
    else {
      done(null, words.filter(isProbablyPresentTense));
    }
  }
}

// This reports a lot of false positives, but may be good enough.
function isProbablyPresentTense(word) {
  var probablyPresentTense = true;

  if (word.length > 4 && word.substr(-2) === 'ed') {
    probablyPresentTense = false;
  }
  else if (word.length > 5 && word.substr(-3) === 'ing') {
    probablyPresentTense = false;
  }
  else if (word.length > 3 && word.substr(-1) === 's') {
    probablyPresentTense = false;
  }

  return probablyPresentTense;
}

module.exports = getRandomVerbs;
