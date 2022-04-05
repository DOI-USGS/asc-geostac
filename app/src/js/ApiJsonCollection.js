var _maxNumberPages = 0;
var _currentPage = 1;
var _numberMatched = 0;
var _numberReturned = 0;
var _features = [];
var _limitVal = 10;

function callAPI() {
  return fetch(
    "https://6vpdmaqce6.execute-api.us-west-2.amazonaws.com/dev/collections"
  ).then(response => response.json());
}

export function getItemCollection(name, queryString) {
  var urlArray = [];
  return callAPI().then(result => {
    for (let i = 0; i < result.collections.length; i++) {
      if (
        result.collections[i].summaries["ssys:targets"] == name.toLowerCase()
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
  console.log(_numberReturned);
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
