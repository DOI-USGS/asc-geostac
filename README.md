# GeoSTAC - Forked CartoCosmos Leaflet webmap with added ability to discover USGS Analysis Ready Data (ARD) holdings using the SpatioTemporal Asset Catalogs (STAC) API.

## Local Requirements

Anaconda or Miniconda installation

## Local Development

- pull and cd into project root
- build environment in conda: `conda env create -f environment.yml`.  This will create a `GeoSTAC` environment with nodejs
- activate your conda environment: `conda activate GeoSTAC`
- run `npm install` from the project root
- run `npm start` to launch your local development server.  Changes should automatically refresh in the browser

##### To create a production build:

```sh
npm run build
```

This will create a folder "dist" with all of the production files needed.
