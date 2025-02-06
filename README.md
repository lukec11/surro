# Surro

Surro uses Apple's private CoreLocation API framework to find the location of nearby LTE cell sites. This can be useful for geolocating users, or for collecting data on nearby cell sites. This library is still under development, which means some features may change over time. In addition, support for Chinese mobile networks is not available, for the reasons described [here](https://github.com/acheong08/apple-corelocation-experiments?tab=readme-ov-file#china).

## Web

Surro is available as a web JavaScript library, [via jsDelivr](https://cdn.jsdelivr.net/npm/surro/dist/web/surro.js). To use it in a browser, you must configure a CORS proxy (see below).

## Generate types
If you update the `proto/apple.proto` file, you can generate the types by running `npx buf generate`. Types are generated automatically upon build.

## Functions

### `getCellLocation(mcc, mnc, cid, lac)`

This function is ideal for geolocating a user based on their nearby cell sites. It's functionally equivalent to Google's Geolocation API, which [actually only returns the location result for the first Cell ID passed in](https://issuetracker.google.com/issues/35824952); for geolocating a user, I would recommend calling multiple times and interpolating the data yourself. Data is returned in an ichnea-compatible format.

### `getSurroundingCells(mcc, mnc, cid, lac)`

This function returns all of the LTE cells that Apple has seen near the passed site, and their respective locations. This is useful more for data collection than for geolocation. It does have a few quirks—for instance, some cells (eg. especially brand new cell sites, temporary COWs), may not show up unless passed directly in. 

### `setCorsProxyUrl(url)`

Because Apple's server doesn't return an `Access-Control-Allow-Origin` header, Surro won't work in a browser directly without a [CORS Proxy](https://httptoolkit.com/blog/cors-proxies/). This function can be called multiple times.

Thanks to: 
- https://github.com/acheong08/apple-corelocation-experiments/
- https://codeberg.org/joelkoen/wtfps/