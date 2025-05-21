export const isIPInCIDR = function(ip: string, cidr: string): boolean {
  // 将IP地址转换为数值
  function ipToNumber(ip: string) {
    const parts = ip.split('.');
    return (parseInt(parts[0]) << 24) + (parseInt(parts[1]) << 16) + (parseInt(parts[2]) << 8) + parseInt(parts[3]);
  }

  // 解析CIDR范围
  const [range, bits] = cidr.split('/');
  const rangeNumber = ipToNumber(range);
  const mask = -1 << (32 - parseInt(bits)); // 创建掩码
  const ipNumber = ipToNumber(ip);

  // 判断IP数值是否在掩码范围内
  return (ipNumber & mask) === rangeNumber;
};

export const buffer2CRID = function(cidr: Buffer) {
  if (cidr.length === 5) {
    const ip: string[] = [];
    cidr.subarray(0, cidr.length - 1).forEach(i => ip.push(String(i)));
    return ip.join('.') + '/' + cidr[cidr.length - 1];
  } else {
    return '0.0.0.0/36';
  }
};

export const isIPv6InCIDR = function(ip: string, cidr: string): boolean {
  function ipv6ToBinary(ip: string): string {
    // 将 IPv6 地址拆分成八组
    const parts = ip.split(':');
    // 将每一组转换为16进制的二进制表示，并补齐为4位
    const binaryParts = parts.map(part => {
      return parseInt(part, 16).toString(2).padStart(16, '0');
    });
    // 合并为一个完整的二进制字符串
    return binaryParts.join('');
  }

  const [base, prefix] = cidr.split('/');
  const ipBinary = ipv6ToBinary(ip);
  const baseBinary = ipv6ToBinary(base);

  // 根据前缀长度截取需要比较的部分
  const ipPrefix = ipBinary.slice(0, +prefix);
  const basePrefix = baseBinary.slice(0, +prefix);

  return ipPrefix === basePrefix;
};
