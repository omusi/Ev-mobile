import { EndpointCloud } from '../types/Tenant';

export default class Configuration {
  public static readonly APPLICATION_NAME = 'Charge-Angels';
  public static readonly SERVER_URL_PREFIX = 'https://rest.';
  public static readonly URL_PREFIX = 'https://';
  public static readonly AWS_REST_ENDPOINT_PROD = `${Configuration.SERVER_URL_PREFIX}charge-angels.com`;
  public static readonly AWS_REST_ENDPOINT_QA = 'https://qa-charge-angels.com';

  public static readonly CAPTCHA_SITE_KEY = '6LcCVJYfAAAAABy-2w4VZ_iUZssSaVpz6LiXCuTR';
  public static readonly PLACES_API_KEY = 'AIzaSyCy7XCkPnmZ6whodSoLQCAUYF1p2huWxks';

  public static readonly DEFAULT_ENDPOINT_CLOUD_ID = 'aws';
  public static readonly ENDPOINT_CLOUDS: EndpointCloud[] = [
    { id: Configuration.DEFAULT_ENDPOINT_CLOUD_ID, name: 'Charge Angels', endpoint: Configuration.AWS_REST_ENDPOINT_PROD }
  ];

  public static isServerLocalePreferred = true;

  public static DEV_ENDPOINT_CLOUDS = [
    {
      id: '127.0.0.1:8080',
      name: 'localhost',
      endpoint: 'http://localhost:8002'
    },
    {
      id: '10.0.2.2:8080',
      name: 'android-local:8080',
      endpoint: 'http://10.0.2.2:8002'
    }
  ];

  public static readonly DEVELOPMENT_ENDPOINT_CLOUDS: EndpointCloud[] = [
    ...Configuration.ENDPOINT_CLOUDS,
    ...Configuration.DEV_ENDPOINT_CLOUDS
  ];

  public static getEndpoints(): EndpointCloud[] {
    if (__DEV__) {
      return Configuration.DEVELOPMENT_ENDPOINT_CLOUDS;
    } else {
      return Configuration.ENDPOINT_CLOUDS;
    }
  }
}
