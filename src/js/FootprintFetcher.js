
/**
 * @param 
 */
export default async function FetchFootprints(targetCollections, collectionId, queryString){

    // Find the collection to search based on ID
    let myCollection = targetCollections.find(collection => collection.id === collectionId);

    // Find the items link from this collection
    let itemsUrl = myCollection.links.find(link => link.rel === "items").href;

    // Promise Tracking
    let fetchPromise = "Not Started";
    let jsonPromise = "Not Started";
    // Result
    let jsonRes = [];

    // Fetch JSON and read into object
    fetchPromise = fetch(
    itemsUrl + queryString
    ).then((res)=>{
        jsonPromise = res.json().then((jsonData)=>{
            jsonRes = jsonData;
        }).catch((err)=>{
            console.log(err);
        });
    }).catch((err) => {
        console.log(err);
    });

    // Wait for completion
    await fetchPromise;
    await jsonPromise;

    // Once we're done waiting, this should contain our footprints
    return jsonRes.features;
}