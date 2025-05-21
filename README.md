# GeoIP Utils

`geoip-utils` is a library for handling IP addresses and IP address segments. Used to verify, resolve, and manage IPv4
and IPv6 address segments.

## Install

```bash
npm install geoip-tools --save-dev
```

## Example

```javascript
import {GeoLocation} from 'geoip-utils'

const geo = new GeoLocation('./geo.dat');
geo.load();
console.log(geo.country.getByNumeric(geo.getIpv4CIDR('8.8.8.8')));
console.log(geo.country.getByNumeric(geo.getIpv6CIDR('2409:8c54:870:310:0:ff:b0ed:40ac')));
```

## Result

``Returns``

```json
{
  "country": "GOOGLE",
  "alpha2Code": "GOOGLE",
  "alpha3Code": "GOOGLE",
  "numeric": 1507
}

```
