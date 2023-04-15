export async function FetchObjects(objInfo, key="id", location="url") {

    let inputWasSingleString = false;

    // function overload handling
    if(typeof objInfo === "string"){
        objInfo = [objInfo];
        inputWasSingleString = true;
    }
    else if (typeof objInfo === "array") {
        console.log("Array!");
    }
    else if (typeof objInfo === "object") {

    }
    else {
        console.error("Unknown Type!", typeof objInfo);
    }

    // Promise Tracking
    let fetchPromise = [];
    let jsonPromise = [];
    // Result
    let jsonRes = [];


    // For each url given
    for(let i = 0; i < objInfo.length; i++) {

        // Fetch JSON from url and read into object
        fetchPromise[i] = fetch(
            objInfo[i]
        ).then((res)=>{
            jsonPromise[i] = res.json().then((jsonData)=>{
                jsonRes[i] = jsonData;
            }).catch((err)=>{
                console.log(err);
            });
        }).catch((err) => {
            console.log(err);
        });
    }

    // Wait for each query to complete
    for(let i = 0; i < objInfo.length; i++){
        await fetchPromise[i];
        await jsonPromise[i];
    }

    // Once we're done waiting, this should contain our footprints
    if(inputWasSingleString) return jsonRes[0];
    else return jsonRes;
}

/** Identifies a collection (from those passed in) based on id and fetches footprints from that collection according to query
 * @async
 * @param {array} targetCollections - An array of all collections for the current target.
 * @param {string} collectionId - The id of the collection to fetch from.
 * @param {string} queryString - The query to narrow the results returned from the collection.
 */
export async function FetchFootprints(targetCollections, collectionId, queryString){

    // Find the collection to search based on ID
    let myCollection = targetCollections.find(collection => collection.id === collectionId);

    // Find the items link from this collection
    let itemsUrl = myCollection.links.find(link => link.rel === "items").href;

    let jsonRes = await FetchObjects(itemsUrl + queryString);
    console.info(jsonRes)
    return jsonRes.features;
}