import { existsSync, openSync, fstatSync, readFileSync } from 'fs';
import { isIPv4, isIPv6 } from 'net';
import { buffer2CRID, isIPInCIDR, isIPv6InCIDR } from '../utils';
import CountryCode from './CountryCode';

class GeoLocation {
  private datPath: string;
  private initStatus: boolean;
  public readonly country: CountryCode;
  private datData: Buffer;

  /**
     * Create GeoLocation example
     * @example
     * new GeoLocation("Geo.dat")
     * @param datPath
     */
  constructor(datPath: string) {
    this.datPath = datPath;
    this.country = new CountryCode();
    this.datData = Buffer.alloc(0);
    this.initStatus = false;
  }

  private _readLine(type: number, ip: string) {
    let offset = 0;
    do {
      let dataBuffer = this.datData.subarray(offset, offset + 3);
      if (dataBuffer[0] === 10) {
        if (dataBuffer[1] === 4) {
          dataBuffer = this.datData.subarray(offset, offset + 9);
          const countryCode = dataBuffer.subarray(7, 9).readInt16BE();
          if (type === 4 && isIPInCIDR(ip, buffer2CRID(dataBuffer.subarray(2, 7)))) {
            return countryCode;
          }
          offset += 9;
        } else if (dataBuffer[1] === 6) {
          const len = dataBuffer[2] * 2;
          // readSync(this.openFileId, dataBuffer, { position: offset, length: len + 6 });
          dataBuffer = this.datData.subarray(offset, offset + len + 6);
          // console.log(len, dataBuffer);
          const maskBuffer = dataBuffer.subarray(3 + len, 3 + len + 1).readUint8();
          const ipBuf = dataBuffer.subarray(3, 3 + len);
          const countryCode = dataBuffer.subarray(4 + len, 6 + len).readInt16BE();
          const ipAddr: string[] = [];
          for (let i = 0; i < ipBuf.length; i += 2) {
            // console.log(i, ipBuf.subarray(i, i + 2));
            ipAddr.push(ipBuf.subarray(i, i + 2).readUInt16BE().toString(16));
          }

          const cidr = ipAddr.join(':') + '::/' + maskBuffer;

          // console.log(countryCode, cidr);

          if (type === 6 && isIPv6InCIDR(ip, cidr)) {
            return countryCode;
          }

          offset += len + 6;
        } else {
          throw new Error(`[GeoLocation] dat file error type = ${dataBuffer[1]} offset = ${offset + 1}`);
        }
      } else {
        throw new Error(`[GeoLocation] dat file error header = ${dataBuffer[0]} offset = ${offset}`);
      }
    } while (offset < this.datData.length);

    return 0;
  }

  /**
     * Load dat file to memory
     * @param datFile
     * @returns {number}
     */
  public load(datFile?: string): number {
    if (datFile) this.datPath = datFile;
    if (existsSync(this.datPath)) {
      this.datData = readFileSync(this.datPath);
    } else {
      throw new Error(`[GeoLocation] does not exist: ${this.datPath}`);
    }
    this.initStatus = true;
    return this.datData.length;
  }

  // /**
  //  * Country id get name
  //  * @example
  //  * GeoLocation.code2Location(1)
  //  * @param code
  //  * @returns {string}
  //  */
  // public code2Country(code: number): string {
  //   return Object.keys(country).filter(key => country[key] === code).shift() || 'unknown';
  // }

  public getIpv4CIDR(address: string): number {
    if (this.isIpv4(address)) {
      return this._readLine(4, address);
    } else {
      return -1;
    }
  }

  public getIpv6CIDR(address: string): number {
    if (this.isIpv6(address)) {
      return this._readLine(6, address);
    } else {
      return -1;
    }
  }

  /**
     * Check IP is ipv6
     * @example
     * GeoLocation.isIpv4('127.0.0.1')
     * @param addr
     */
  public isIpv4(addr: string) {
    return isIPv4(addr);
  }

  /**
     * Check IP is ipv6
     * @example
     * GeoLocation.isIpv6('2409:8c54:870:310:0:ff:b0ed:40ac')
     * @param addr
     */
  public isIpv6(addr: string) {
    return isIPv6(addr);
  }
}

export {
  GeoLocation
};
