inherits = function (ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true,
    },
  });
};

var Tokenizer = function () {};

Tokenizer.prototype.trim = function (array) {
  while (array[array.length - 1] == "") array.pop();

  while (array[0] == "") array.shift();

  return array;
};

// Expose an attach function that will patch String with new methods.
Tokenizer.prototype.attach = function () {
  var self = this;

  String.prototype.tokenize = function () {
    return self.tokenize(this);
  };
};

Tokenizer.prototype.tokenize = function () {};

var RegexpTokenizer = function (options) {
  var options = options || {};
  this._pattern = options.pattern || this._pattern;
  this.discardEmpty = options.discardEmpty || true;

  // Match and split on GAPS not the actual WORDS
  this._gaps = options.gaps;

  if (this._gaps === undefined) {
    this._gaps = true;
  }
};

inherits(RegexpTokenizer, Tokenizer);

RegexpTokenizer.prototype.tokenize = function (s) {
  var results;

  if (this._gaps) {
    results = s.split(this._pattern);
    return this.discardEmpty ? _.without(results, "", " ") : results;
  } else {
    return s.match(this._pattern);
  }
};

var WordTokenizer = function (options) {
  this._pattern = /[^A-Za-z?-??-?0-9_]+/;
  RegexpTokenizer.call(this, options);
};

inherits(WordTokenizer, RegexpTokenizer);

var stopwords = [
  "about",
  "above",
  "after",
  "again",
  "all",
  "also",
  "am",
  "an",
  "and",
  "another",
  "any",
  "are",
  "as",
  "at",
  "be",
  "because",
  "been",
  "before",
  "being",
  "below",
  "between",
  "both",
  "but",
  "by",
  "came",
  "can",
  "cannot",
  "come",
  "could",
  "did",
  "do",
  "does",
  "doing",
  "during",
  "each",
  "few",
  "for",
  "from",
  "further",
  "get",
  "got",
  "has",
  "had",
  "he",
  "have",
  "her",
  "here",
  "him",
  "himself",
  "his",
  "how",
  "if",
  "in",
  "into",
  "is",
  "it",
  "its",
  "itself",
  "like",
  "make",
  "many",
  "me",
  "might",
  "more",
  "most",
  "much",
  "must",
  "my",
  "myself",
  "never",
  "now",
  "of",
  "on",
  "only",
  "or",
  "other",
  "our",
  "ours",
  "ourselves",
  "out",
  "over",
  "own",
  "said",
  "same",
  "see",
  "should",
  "since",
  "so",
  "some",
  "still",
  "such",
  "take",
  "than",
  "that",
  "the",
  "their",
  "theirs",
  "them",
  "themselves",
  "then",
  "there",
  "these",
  "they",
  "this",
  "those",
  "through",
  "to",
  "too",
  "under",
  "until",
  "up",
  "very",
  "was",
  "way",
  "we",
  "well",
  "were",
  "what",
  "where",
  "when",
  "which",
  "while",
  "who",
  "whom",
  "with",
  "would",
  "why",
  "you",
  "your",
  "yours",
  "yourself",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "$",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "0",
  "_",
];

var tokenizer = new WordTokenizer();

function buildDocument(text, key) {
  var stopOut;

  if (typeof text === "string") {
    text = tokenizer.tokenize(text.toLowerCase());
    stopOut = true;
  } else if (!_.isArray(text)) {
    stopOut = false;
    return text;
  }

  return text.reduce(
    function (document, term) {
      // next line solves https://github.com/NaturalNode/natural/issues/119
      if (typeof document[term] === "function") document[term] = 0;
      if (!stopOut || stopwords.indexOf(term) < 0) document[term] = document[term] ? document[term] + 1 : 1;
      return document;
    },
    { __key: key }
  );
}

function tf(term, document) {
  return document[term] ? document[term] : 0;
}

function documentHasTerm(term, document) {
  return document[term] && document[term] > 0;
}

function TfIdf(deserialized) {
  if (deserialized) this.documents = deserialized.documents;
  else this.documents = [];

  this._idfCache = {};
}

// backwards compatibility for < node 0.10
function isEncoding(encoding) {
  if (typeof Buffer.isEncoding !== "undefined") return Buffer.isEncoding(encoding);
  switch ((encoding + "").toLowerCase()) {
    case "hex":
    case "utf8":
    case "utf-8":
    case "ascii":
    case "binary":
    case "base64":
    case "ucs2":
    case "ucs-2":
    case "utf16le":
    case "utf-16le":
    case "raw":
      return true;
  }
  return false;
}

TfIdf.tf = tf;

TfIdf.prototype.idf = function (term, force) {
  // Lookup the term in the New term-IDF caching,
  // this will cut search times down exponentially on large document sets.
  if (this._idfCache[term] && this._idfCache.hasOwnProperty(term) && force !== true) return this._idfCache[term];

  var docsWithTerm = this.documents.reduce(function (count, document) {
    return count + (documentHasTerm(term, document) ? 1 : 0);
  }, 0);

  var idf = 1 + Math.log(this.documents.length / (1 + docsWithTerm));

  // Add the idf to the term cache and return it
  this._idfCache[term] = idf;
  return idf;
};

// If restoreCache is set to true, all terms idf scores currently cached will be recomputed.
// Otherwise, the cache will just be wiped clean
TfIdf.prototype.addDocument = function (document, key, restoreCache) {
  this.documents.push(buildDocument(document, key));

  // make sure the cache is invalidated when new documents arrive
  if (restoreCache === true) {
    for (var term in this._idfCache) {
      // invoking idf with the force option set will
      // force a recomputation of the idf, and it will
      // automatically refresh the cache value.
      this.idf(term, true);
    }
  } else {
    this._idfCache = {};
  }
};

// If restoreCache is set to true, all terms idf scores currently cached will be recomputed.
// Otherwise, the cache will just be wiped clean
TfIdf.prototype.addFileSync = function (path, encoding, key, restoreCache) {
  if (!encoding) encoding = "utf8";
  if (!isEncoding(encoding)) throw new Error("Invalid encoding: " + encoding);

  var document = fs.readFileSync(path, encoding);
  this.documents.push(buildDocument(document, key));

  // make sure the cache is invalidated when new documents arrive
  if (restoreCache === true) {
    for (var term in this._idfCache) {
      // invoking idf with the force option set will
      // force a recomputation of the idf, and it will
      // automatically refresh the cache value.
      this.idf(term, true);
    }
  } else {
    this._idfCache = {};
  }
};

TfIdf.prototype.tfidf = function (terms, d) {
  var _this = this;

  if (!_.isArray(terms)) terms = tokenizer.tokenize(terms.toString().toLowerCase());

  return terms.reduce(function (value, term) {
    var idf = _this.idf(term);
    idf = idf === Infinity ? 0 : idf;
    return value + tf(term, _this.documents[d]) * idf;
  }, 0.0);
};

TfIdf.prototype.listTerms = function (d) {
  var terms = [];

  for (var term in this.documents[d]) {
    if (term != "__key") terms.push({ term: term, tfidf: this.tfidf(term, d) });
  }

  return terms.sort(function (x, y) {
    return y.tfidf - x.tfidf;
  });
};

TfIdf.prototype.tfidfs = function (terms, callback) {
  var tfidfs = new Array(this.documents.length);

  for (var i = 0; i < this.documents.length; i++) {
    tfidfs[i] = this.tfidf(terms, i);

    if (callback) callback(i, tfidfs[i], this.documents[i].__key);
  }

  return tfidfs;
};
