var _maxNumberPages = 0;
var _currentPage = 1;
var _numberMatched = 0;
var _numberReturned = 0;
var _limitVal = 10;


/**
 * @function setNumberMatched
 * @description Sets the value of the matched number of footprints
 */
export function setNumberMatched(matched) {
  _numberMatched = matched;

  if (_limitVal != 0 && _numberMatched != 0){
    setMaxNumberPages(Math.ceil(_numberMatched/_limitVal));
  }
  if (_numberMatched == 0){
    setMaxNumberPages(0);
  }
}

/**
 * @function getNumberMatched
 * @description Gets the value of the return number of footprints
 */
export function getNumberMatched() {
  return _numberMatched
}

/**
 * @function setNumberReturned
 * @description Sets the value of the returned number of footprints
 */
export function setNumberReturned(returned) {
  _numberReturned = returned;
}

/**
 * @function getNumberReturned
 * @description Gets the value of the returned number of footprints
 */
export function getNumberReturned() {
  return _numberReturned;
}

/**
 * @function setMaxNumberPages
 * @description Sets the value of the max number of pages possible
 */
export function setMaxNumberPages(pages) {
  _maxNumberPages = pages;
}

/**
 * @function getMaxNumberPages
 * @description Gets the value of the max number of pages possible
 */
export function getMaxNumberPages() {
  return _maxNumberPages;
}

/**
 * @function setCurrentPage
 * @description Sets the value of the current page
 */
export function setCurrentPage(page) {
  _currentPage = page;
}

/**
 * @function setLimit
 * @description Sets the value of the limit
 */
export function setLimit(val) {
  _limitVal = val;
}
