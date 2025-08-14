let apple_api_url = 'https://gs-loc.apple.com/clls/wloc'; // China not supported, they use a different URL

export function setCorsProxyUrl(url: string) {
  apple_api_url = url + apple_api_url;
}

export { apple_api_url };
