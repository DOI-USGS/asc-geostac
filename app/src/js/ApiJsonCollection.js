var _maxNumberPages = 0;
var _currentPage = 1;
var _numberMatched = 0;
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
 * @function setNumberMatched
 * @description Sets the value of the return number of footprints
 */
export function setNumberMatched(matched) {
  _numberMatched = matched;

  if (_limitVal != 0 && matched != 0){
    setMaxNumberPages(Math.floor(matched/_limitVal));
  }
  if (matched == 0){
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
