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
        fetchPromise[key] = fetch(
            objInfo[key]
        ).then((res)=>{
            jsonPromise[key] = res.json().then((jsonData)=>{
                jsonRes[key] = jsonData;
            }).catch((err)=>{
                console.log(err);
            });
        }).catch((err) => {
            console.log(err);
        });
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
    let collectionUrl;
    let offsetMulitiplier;
    let pageInfo = "";
    if(collection.url.slice(-1) !== "?") {
        pageInfo += "&"
    }
    pageInfo += "page=" + page;
    if (step != 10){
      pageInfo += "&limit=" + step;
    }

    // check for pyGeo API
    if (!collection.url.includes('stac')) 
    {

        // set offset for 5 & 10 steps
        offsetMulitiplier = (page * 10 - step);
        pageInfo = "&offset=" + offsetMulitiplier;

        
        // checks for 5 change in step
        if (step <= 10)
        {
               
            // splice limit and change to new limit
            collectionUrl = collection.url.split('&limit=')[0];
            collection.url = collectionUrl;
                
                
            // update page pageInfo
            pageInfo = "&offset=" + offsetMulitiplier + "&limit=" + step;
            
            
        }
        // checks for 50 & 100 step
        else if (step == 50 || step == 100)
        {

            // splice limit and change to new limit
            collectionUrl = collection.url.split('&limit=')[0];
            collection.url = collectionUrl;

            // check for first page 
            if (page == 1)
            {
                // set multiplier to 0
                offsetMulitiplier = 0;
            }
            // check for second page
            else if (page == 2)
            {   
                // set multiplier to step
                offsetMulitiplier = step;
            
            }
            else
            {
                // check for 50 and set pages according
                if (step == 50)
                {
                    offsetMulitiplier = page * step - 50;
                }
                // check for 100 and set pages according
                else 
                {
                    offsetMulitiplier = page * step - 100;
                }
            }

            // update page pageInfo
            pageInfo = "&offset=" + offsetMulitiplier + "&limit=" + step;
        }
        
    }
    
    // reset offset
    offsetMulitiplier = 0;

    let jsonRes = await FetchObjects(collection.url + pageInfo);
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

        if (!fullResponse || !fullResponse.features) {
            console.error('Invalid fullResponse:', fullResponse);
            return [];
        }

        newFeatures = fullResponse.features;

        // Handle edge case where you may have requested more features than  still available
        if (newFeatures.length < myStep) {
            return newFeatures;
        } else {
            return newFeatures.slice(skip, newFeatures.length);
        }
    }
    return newFeatures;
}
