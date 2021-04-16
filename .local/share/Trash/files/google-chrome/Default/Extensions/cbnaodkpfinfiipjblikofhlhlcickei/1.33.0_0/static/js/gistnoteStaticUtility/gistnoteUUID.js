var GistnoteUUID = {
  pattern: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",
  replacements: {
    x: "0123456789abcdef",
    y: "89ab",
  },
  pattern_re: /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}/,

  _getRandomCharacter: function (char_list) {
    var random_position = Math.floor(Math.random() * char_list.length);
    return char_list.charAt(random_position);
  },

  _getPatternCharacter: function (character) {
    return character in GistnoteUUID.replacements
      ? GistnoteUUID._getRandomCharacter(GistnoteUUID.replacements[character])
      : character;
  },

  validate: function (id) {
    return GistnoteUUID.pattern_re.test(id);
  },

  generate: function () {
    return GistnoteUUID.pattern.split("").map(GistnoteUUID._getPatternCharacter).join("");
  },
};
