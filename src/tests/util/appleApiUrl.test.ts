import { apple_api_url, setCorsProxyUrl } from '../../util/appleApiUrl';
import { expect } from 'chai';

describe('setCorsProxyUrl', () => {
  it('should change the URL to reflect the CORS proxy', () => {
    setCorsProxyUrl('https://example.com/proxy?');

    expect(apple_api_url)
      .to.be.a('string')
      .and.satisfy((str: string) =>
        str.startsWith('https://example.com/proxy?'),
      );
  });
});
