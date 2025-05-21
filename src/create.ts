import { readFileSync, readdirSync } from 'fs';
import { writeFileSync } from 'node:fs';
import CountryCode from './libs/CountryCode';

const files = readdirSync('./text');

const country = new CountryCode();

const buffers: Buffer[] = [];

const rowStartBuffer = Buffer.alloc(1);
rowStartBuffer.writeUInt8(10);

files.forEach(file => {
  const code = file.slice(0, file.length - 4);
  const ipaddr = readFileSync('./text/' + file, 'utf-8').split('\n');
  const countryBuffer = Buffer.alloc(2);
  countryBuffer.writeUInt16BE(country.getByAlpha2Code(code.toUpperCase()).numeric);

  ipaddr.forEach(txt => {
    const ipType = Buffer.alloc(1);

    if (txt.includes('.')) {
      ipType.writeInt8(4);// ipv4
      buffers.push(rowStartBuffer);
      buffers.push(ipType);

      const [ip, mask] = txt.split('/');
      const ipArr = ip.split('.').map(i => Number(i));
      ipArr.push(Number(mask));
      const ipBuffer = Buffer.alloc(5);
      buffers.push(...[ipBuffer, countryBuffer]);

      // cache.push(ipBuffer);
      ipArr.forEach((data, i) => {
        ipBuffer.writeUInt8(data, i);
      });
    } else if (txt.includes('::')) {
      ipType.writeInt8(6);// ipv6
      buffers.push(rowStartBuffer);
      buffers.push(ipType);
      const [ip, mask] = txt.split('::/');
      const ipArr = ip.split(':').map(i => parseInt(i, 16));
      const ipBuffer = Buffer.alloc(2 * ipArr.length + 2);
      ipBuffer.writeUInt8(ipArr.length);
      buffers.push(...[ipBuffer, countryBuffer]);

      ipArr.forEach((data, i) => {
        ipBuffer.writeUInt16BE(data, 1 + i * 2);
      });
      console.log(ipArr, ip.split(':'), ipBuffer);

      ipBuffer.writeUInt8(Number(mask), ipBuffer.length - 1);
    }
  });

  // process.exit(0);
});

writeFileSync('./geo.dat', Buffer.concat(buffers));
