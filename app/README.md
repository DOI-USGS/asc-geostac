# GeoSTAC - Forked CartoCosmos Leaflet webmap with added ability to discover USGS Analysis Ready Data (ARD) holdings using the SpatioTemporal Asset Catalogs (STAC) API.

Repository for the GeoSTAC Capstone Team.

### Building and running on localhost
#
Install conda:
* [Windows](https://docs.conda.io/projects/conda/en/latest/user-guide/install/windows.html)
* [Mac](https://docs.conda.io/projects/conda/en/latest/user-guide/install/macos.html)
* [Linux](https://docs.conda.io/projects/conda/en/latest/user-guide/install/macos.html)

Clone repository
```sh
git clone https://github.com/GeoSTAC/CartoCosmos-with-STAC.git
```

Once the repository is cloned ```cd``` in to the ```app folder```
ie :
```sh
cd cloned_location/GeoSTAC/CartoCosmos/app
```
To setup the conda environment run the following command.

```sh
conda env create -f environment.yml
```

Once the conda environment is created run the following command to activate it.

```sh
conda activate GeoSTAC
```

Then to install the project run

```sh
npm install
```

##### To create a production build:

```sh
npm run build
```

This will create a folder "dist" with all of the production files needed.

##### To run the development server:

```sh
npm start
```

This will open a development server on port 8000 which will automatically compile and update in the browser window on save.
