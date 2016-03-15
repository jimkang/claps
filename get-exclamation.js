var config = require('./config/config');
var createWordnok = require('wordnok').createWordnok;
var probable = require('probable');
var callNextTick = require('call-next-tick');
var getRandomVerbs = require('./get-random-verbs');
var WanderGoogleNgrams = require('wander-google-ngrams');
var createIsCool = require('iscool');
var async = require('async');
var toTitleCase = require('titlecase');

var iscool = createIsCool();

var wordnok = createWordnok({
  apiKey: config.wordnikAPIKey
});

function getExclamation(done) {
  async.waterfall(
    [
      getRandomVerbs,
      pickAtRandom,
      getElaborationForVerb,
      formatVerbExclamation
    ],
    done
  );
}

function getElaborationForVerb(word, done) {
  getNgramElaboration(word, true, done);
}

function getNgramElaboration(theWord, wordIsVerb, done) {
  var createWanderStream = WanderGoogleNgrams({
    wordnikAPIKey: config.wordnikAPIKey
  });

  var opts = {
    word: theWord,
    direction: 'forward',
    repeatLimit: 1,
    tryReducingNgramSizeAtDeadEnds: true,
    shootForASentence: true,
    maxWordCount: 20,
  };

  if (wordIsVerb) {
    opts.forwardStages = [
      {
        name: 'pushedVerb',
        needToProceed: ['noun', 'pronoun', 'noun-plural', 'adjective'],
        disallowCommonBadExits: true,
        lookFor: '*_NOUN',
        posShouldBeUnambiguous: true
      },
      {
        name: 'done'
      }
    ];
  }

  var stream = createWanderStream(opts);
  var words = [theWord];

  stream.on('error', reportError);
  stream.on('end', passWords);
  stream.on('data', saveWord);

  function saveWord(word) {
    if (word !== theWord) {
      if (!iscool(word)) {
        console.log('Uncool word:', word);
      }
      else {
        words.push(word);
      }
    }
  }

  function reportError(error) {
    // Don't stop everything for a stream error.
    console.log(error);
  }

  function passWords() {
    done(null, words);
  }
}

function pickAtRandom(things, done) {
  callNextTick(done, null, probable.pickFromArray(things));
}

function formatVerbExclamation(words, done) {
  var exclamation =  words.reduce(clapOnWord, '').toUpperCase();
  callNextTick(done, null, exclamation + '!');
}

function clapOnWord(phrase, word) {
  if (phrase.length > 0) {
    phrase += ' 👏 ';
  }
  phrase += word;
  return phrase;
}

module.exports = getExclamation;
