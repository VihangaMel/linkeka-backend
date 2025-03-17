function valid_characters(username) {
  const regex = /[^A-Za-z0-9]+/g;
  return !regex.test(username);
}

function valid_length(username) {
  const regex = /^[a-zA-Z0-9]{5,20}$/;
  return regex.test(username);
}

function no_white_space(username) {
  const regex = /\s/;
  return !regex.test(username);
}

module.exports = { valid_characters, valid_length, no_white_space };
