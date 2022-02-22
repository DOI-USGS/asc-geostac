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
		this._imageArray = [];

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
	*/
	/**
	 * function name: displayGeoTiff
	 * Desc: Takes in a URL for the asset file and changes the content
	 * inside of the geotiff div to display the asset to user
	 * Input: imageURL - String: Url link from the STAC catalogue
	 * */
	displayGeoTiff( imageURL )
	{
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

		

	}


	/**
	 * Function name: toggleViewer
	 * Desc: This function will open and close the geotiffviewer depending
	 * on whether it is open or closed.
	 * Note: Could adjust the main maps size to display geotiff next to map 
	 * */
	toggleViewer()
	{
		const geoTiffContainerDiv = document.getElementById("geoTiff-Container") 
		
		if(geoTiffContainerDiv != null )
		{
			if (geoTiffContainerDiv.style.display == "none")
			{
				geoTiffContainerDiv.style.display = "block";

			}
			else
			{
				geoTiffContainerDiv.style.display = "none"; 
			}
		}
		
	}


}