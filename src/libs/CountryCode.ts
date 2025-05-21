import CountryData from '../constants/CountryData';

export type CountryCodeItem = {
    country: string,
    alpha2Code: string,
    alpha3Code: string,
    numeric: number
}

const unknownCountry = {
  country: 'UNKNOWN',
  alpha2Code: 'UNKNOWN',
  alpha3Code: 'UNKNOWN',
  numeric: -1
};

class CountryCode {
  public country: CountryCodeItem[];

  constructor() {
    this.country = CountryData;
  }

  public buildRule() {
    return JSON.stringify(this.country.map(item => item.alpha2Code + ',PROXY'), null, 2);
  }

  public getByNumeric(num: number) {
    return this.country.find(item => item.numeric === num) || unknownCountry;
  }

  public getByAlpha2Code(code: string) {
    return this.country.find(item => item.alpha2Code === code) || unknownCountry;
  }

  public getByAlpha3Code(code: string) {
    return this.country.find(item => item.alpha3Code === code) || unknownCountry;
  }
}

export default CountryCode;
