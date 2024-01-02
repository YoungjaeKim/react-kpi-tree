/**
 * a utility file to have commonly used functions.
 * @param str
 * @returns {boolean}
 */

/**
 * Check if the string is undefined, null or empty.
 * @param str
 * @returns {boolean}
 */
function isNullOrEmpty(str) {
    return (typeof str === 'undefined') || str === null || str.trim() === '';
}

module.exports = {
    isNullOrEmpty
};
