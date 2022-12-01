var _maxNumberPages = 0;
var _currentPage = 1;
var _numberMatched = 0;
var _numberReturned = 0;
var _features = [];
var _limitVal = 10;

/**
 * @function callAPI
 * @description Fetches the STAC API at the collections level
 */
function callAPI() {
  return fetch(
    "https://stac.astrogeology.usgs.gov/api/collections"
  ).then(response => response.json());
}

/**
 * @function getItemCollection
 * @description Function takes the fetch return from callAPI and iterates through
 * collections with matching target name, if there are multiple collections for
 * the same target, these will be pushed to an array. Then the function fetches
 * all the items within the associated collections.
 * @param {String} name - The target name
 * @param {String} queryString - the query string to fetch against
 */
export function getItemCollection(name, queryString) {
  var urlArray = [];
  return callAPI().then(result => {
    for (let i = 0; i < result.collections.length; i++) {
      if (result.collections[i].hasOwnProperty("summaries")){
        if (
          result.collections[i].summaries["ssys:targets"][0].toLowerCase() == name.toLowerCase()
        ) {
          let length = result.collections[i].links.length;
          for (let j = 0; j < length; j++) {
            let link = result.collections[i].links[j];
            if (link.rel == "items") {
              var url = result.collections[i].links[j].href;
              url = url + queryString;
              urlArray.push(url);
            }
          }
        }
      }
    }
    if (urlArray.length == 0) {
      return;
    }
    let promiseArray = [];
    for (let i = 0; i < urlArray.length; i++) {
      promiseArray.push(fetch(urlArray[i]));
      let urlResults = "";
      for(let i = 0; i < urlArray.length; i++){
        urlResults += urlArray[i] + " ";
      }
      document.getElementById("query-textarea").innerText = urlResults;
    }
    return Promise.all(promiseArray).then(function(responses) {
      return Promise.all(
        responses.map(function(response) {
          return response.json();
        })
      );
    });
  });
}

/**
 * @function setFeatures
 * @description Sets the value of the max number of pages possible
 */
export function setFeatures(features) {
  _features = features
}

/**
 * @function getFeatures
 * @description Gets the value of the max number of pages possible
 */
export function getFeatures() {
  return _features;
}


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
 * @function getCurrentPage
 * @description Gets the value of the current page
 */
export function getCurrentPage() {
  return _currentPage;
}

/**
 * @function setLimit
 * @description Sets the value of the limit
 */
export function setLimit(val) {
  _limitVal = val;
}
