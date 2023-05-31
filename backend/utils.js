/**
 * a utility file to have commonly used functions.
 * @param str
 * @returns {boolean}
 */
function isNullOrEmpty(str) {
    return str === null || str.trim() === '';
}

module.exports = {
    isNullOrEmpty
};
