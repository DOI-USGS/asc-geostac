/*

*/
export default class GeoTiffViewer {


	/**
	 * Function name: Constructor
	 * Desc: The constructor function for the class
	 * GeoTiffViewer takes in the div id that the
	 * viewer will reside in
	 * Input: imageDiv - String: the name of div ID where the image
	 * asset will be displayed.
	**/
	constructor( imageDiv )
	{
		this._imgDiv = imageDiv;

		const currentIndex = 0;

	}


	/*
	fetch(imageURL)
			.then(response => response.blob())
			.then(imageBlob => {

				const imageObjectUrl = URL.createObjectURL(imageBlob);
				console.log(imageObjectUrl);
			})

			this._imageArray.push(imageURL);

		(async () => {
			const response = await fetch(imageURL)
			const imageBlob = await response.blob()
			const reader = new FileReader();
			reader.readAsDataURL(imageBlob);
			reader.onloadend = () => {
				const base64data = reader.result;
				console.log(base64data);
			}

			const geoTiffDiv = document.getElementById(this._imgDiv)
			geoTiffDiv.innerHTML = '';

			const imageObjectURL = URL.createObjectURL(imageBlob);
			var img = document.createElement('img');

			img.src = imageObjectURL;

			document.getElementById(this._imgDiv).appendChild(img);

		})
	*/
	/**
	 * function name: displayGeoTiff
	 * Desc: Takes in a URL for the asset file and changes the content
	 * inside of the geotiff div to display the asset to user
	 * Input: imageURL - String: Url link from the STAC catalogue
	 * */
	displayGeoTiff( imageURL )
	{


		document.getElementById("GeoTiffAsset").src=imageURL;

	}

	changeMetaData( GeoTiffCollectionName, GeoTiffIDName, GeoTiffDateName, Assets )
	{
		document.getElementById("GeoTiffCollection").innerHTML = ("<strong>Collection:</strong>&nbsp;"
			+ GeoTiffCollectionName);

		document.getElementById("GeoTiffID").innerHTML = ("<strong>ID:</strong>&nbsp;"
			+ GeoTiffIDName.substring(0));

		document.getElementById("GeoTiffDate").innerHTML = ("<strong>Date:</strong>&nbsp;"
			+ GeoTiffDateName);

		document.getElementById("Assets").innerHTML = ("<strong>Assets:</strong>&nbsp;<br>");
		for (const asset in Assets) {
			document.getElementById("Assets").innerHTML += ("<a href=" + Assets[asset]["href"] + ">" + asset + "</a><br>");
		}

	}

	openModal()
	{
		if (document.getElementById("GeoTiffModal") == null) {
			return;
		}
		document.getElementById("map-container").style.zIndex = "-1";
		document.getElementById("GeoTiffModal").classList.add('active');
		document.getElementById("GeoTiffOverlay").classList.add('active');

	}

	closeModal()
	{
		if (document.getElementById("GeoTiffModal") == null) {
			return;
		}
		document.getElementById("map-container").style.zIndex = "10";
		document.getElementById("GeoTiffModal").classList.remove('active');
		document.getElementById("GeoTiffOverlay").classList.remove('active');
	}


}
