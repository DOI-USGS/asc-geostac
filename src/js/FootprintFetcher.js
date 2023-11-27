export async function FetchObjects(objInfo) {

    let inputWasSingleString = false;

    // function overload handling
    if(typeof objInfo === "string"){
        objInfo = { "defaultKey" : objInfo };
        inputWasSingleString = true;
    }

    // Promise Tracking
    let fetchPromise = {};
    let jsonPromise = {};
    // Result
    let jsonRes = {};


    // For each url given
    for(const key in objInfo) {
        // Fetch JSON from url and read into object
        // The stylesheet ones \/ get 404s so I'm discarding them for now
        if (!key.includes(": stylesheet")){
            fetchPromise[key] = fetch(
                objInfo[key]
            ).then((res) => {
                jsonPromise[key] = res.json().then((jsonData) => {
                    jsonRes[key] = jsonData;
                }).catch((err) => {
                    console.log(err);
                });
            }).catch((err) => {
                console.log(err);
            });
        }
    }

    // Wait for each query to complete
    for(const key in objInfo){
        await fetchPromise[key];
        await jsonPromise[key];
    }

    // After waiting, this contains footprints
    if(inputWasSingleString) return jsonRes["defaultKey"];
    else return jsonRes;
}

/** Identifies a collection (from those passed in) based on id and fetches footprints from that collection according to query
 * @async
 * @param {array} collection - A collection with a url property.
 * @param {string} collectionId - The id of the collection to fetch from.
 * @param {string} queryString - The query to narrow the results returned from the collection.
 */
export async function FetchFootprints(collection, page, step){
    const stacDefaultLimit = 10;
    const pyDefaultLimit = 25;
    let baseURL = collection.url;
    let pageInfo = "";

    // get rid of default limit present in some pygeoapi urls
    if(baseURL.slice(-9) == "&limit=10") {
        baseURL = baseURL.slice(0, -9);
    }

    if(collection.url.slice(-1) !== "?") {
        pageInfo += "&"
    }

    if (collection.url.includes('stac'))
    {
        pageInfo += "page=" + page;
        if (step !== stacDefaultLimit) {
            pageInfo += "&limit=" + step;
        }
    }
    else {
        pageInfo += "offset=" + step * (page - 1);
        if (step !== pyDefaultLimit) {
            pageInfo += "&limit=" + step;
        }
    }

    let jsonRes = await FetchObjects(baseURL + pageInfo);
    return jsonRes.features;
}

export async function FetchStepRemainder(featureCollection, myStep) {
    if (!featureCollection || !featureCollection.features) {
        console.error('Invalid featureCollection:', featureCollection);
        return [];
    }

    let myPage = Math.ceil(featureCollection.features.length / myStep);
    let skip = featureCollection.features.length % myStep;
    let newFeatures = [];
    let fullResponse;

    if (skip !== 0) {
        fullResponse = await FetchFootprints(featureCollection, myPage, myStep);

        if (!fullResponse) {
            console.error('Invalid fullResponse:', fullResponse);
            return [];
        }

        newFeatures = fullResponse;

        // Handle edge case where you may have requested more features than  still available
        if (newFeatures.length < myStep) {
            return newFeatures;
        } else {
            return newFeatures.slice(skip, newFeatures.length);
        }
    }
    return newFeatures;
}
