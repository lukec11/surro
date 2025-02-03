# Surro

Surro uses Apple's private CoreLocation API framework to find the location of nearby LTE cell sites. This can be useful for geolocating users, or for collecting data on nearby cell sites. This library is still under development, which means some features may change over time. In addition, support for Chinese mobile networks is not available, for the reasons described [here](https://github.com/acheong08/apple-corelocation-experiments?tab=readme-ov-file#china).

## Generate types
If you update the `proto/apple.proto` file, you can generate the types by running `npx buf generate`.

## Functions

### `getCellLocation(mcc, mnc, cid, lac)`

This function is ideal for geolocating a user based on their nearby cell sites. It's functionally equivalent to Google's Geolocation API, which [actually only returns the location result for the first Cell ID passed in](https://issuetracker.google.com/issues/35824952); for geolocating a user, I would recommend calling multiple times and interpolating the data yourself. Data is returned in an ichnea-compatible format.

### `getSurroundingCells(mcc, mnc, cid, lac)`

This function returns all of the LTE cells that Apple has seen near the passed site, and their respective locations. This is useful more for data collection than for geolocation. It does have a few quirks—for instance, some cells (eg. especially brand new cell sites, temporary COWs), may not show up unless passed directly in. 

Thanks to: 
- https://github.com/acheong08/apple-corelocation-experiments/
- https://codeberg.org/joelkoen/wtfps/