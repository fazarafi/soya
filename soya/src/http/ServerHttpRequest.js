import url from 'url';
import path from 'path';

import IncomingRequest from '../server/IncomingRequest';

/**
 * @SERVER
 */
export default class ServerHttpRequest extends IncomingRequest {
  /**
   * @type {http.incomingMessage}
   */
  _httpRequest: Object;

  /**
   * @type {Object}
   */
  _parsedUrl;

  /**
   * @type {number}
   */
  _maxRequestBodyLength;

  /**
   * @param {http.incomingMessage} httpRequest
   * @param {number} maxRequestBodyLength
   */
  constructor(httpRequest, maxRequestBodyLength) {
    super();
    this._httpRequest = httpRequest;
    this._parsedUrl = url.parse(httpRequest.url, true);
    this._maxRequestBodyLength = maxRequestBodyLength;
  }

  /**
   * @param {string} givenHostPath
   * @returns {boolean}
   */
  startsWith(givenHostPath) {
    var hostAndPath = path.join(this.getHost(), this.getPath());
    return hostAndPath.substr(0, givenHostPath.length) == givenHostPath;
  }

  /**
   * @return {Object}
   * @override
   */
  getInnerRequest() {
    return this._httpRequest;
  }

  /**
   * @returns {string}
   * @override
   */
  getMethod() {
    return this._httpRequest.method;
  }

  /**
   * @returns {boolean}
   */
  isSecure() {
    // TODO: Create default nginx configuration for usage, use our own architecture, create contract to know whether this is https or not (use header? x-forwarded-proto like our arch).
    // TODO: Make this configurable.
    return this._httpRequest.headers['x-forwarded-proto'] === 'https';
  }

  /**
   * @returns {Object}
   */
  getHeaders() {
    return this._httpRequest.headers;
  }

  /**
   * @returns {string}
   * @override
   */
  getDomain() {
    var hostSplit = this.getHost().split(':');
    return hostSplit[0].trim();
  }

  /**
   * @returns {string}
   * @override
   */
  getHost() {
    return this._httpRequest.headers.host;
  }

  /**
   * @returns {string}
   * @override
   */
  getPath() {
    return this._parsedUrl.pathname;
  }

  /**
   * @returns {string}
   */
  getUrl() {
    return (this.isSecure() ? 'https' : 'http') + '://' + this.getDomain() + this.getPath();
  }

  /**
   * @return {string}
   */
  getQuery() {
    return this._parsedUrl.search;
  }

  /**
   * @returns {Object}
   */
  getQueryParams() {
    let result = {}, key;
    for (key in this._parsedUrl.query) {
      result[key] = this._parsedUrl.query[key];
    }
    return result;
  }

  getHash() {
    return '';
  }

  /**
   * @return {Promise}
   */
  getBody() {
    return new Promise((resolve, reject) => {
      if (this._httpRequest.method === 'POST') {
        var requestBody = '';

        this._httpRequest.on('data', function(chunk) {
          requestBody += chunk;

          if (requestBody.length > this._maxRequestBodyLength) {
            this._httpRequest.connection.destroy();
            requestBody = new Error('Request data exceed maximum length');
          }
        }).on('end', function () {
          if (requestBody instanceof Error)
            reject(requestBody);
          else
            resolve(requestBody);
        });
      }
    });
  }
}