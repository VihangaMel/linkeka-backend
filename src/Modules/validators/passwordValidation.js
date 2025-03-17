/**
 * @module valid_length
 * @description A utility function that checks if a given password meets the minimum length requirement.
 * The function returns true if the password is at least 8 characters long; otherwise, it returns false.
 * 
 * @param {string} password - The password to be validated.
 * @returns {boolean} Returns true if the password length is valid (8 characters or more), false otherwise.
 * 
 * @example
 * const { valid_length } = require('./path/to/valid_length');
 * 
 * const password1 = "myPassword123";
 * const password2 = "short";
 * 
 * console.log(valid_length(password1)); // Output: true
 * console.log(valid_length(password2)); // Output: false
 */
function valid_length(password){
    return password.length >= 8;
}

module.exports = {valid_length};