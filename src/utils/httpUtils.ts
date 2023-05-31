import * as http from 'http';
import * as https from 'https';

import { timeout } from './timer';

/**
 * Checks local server for a free port.
 *
 * @param port Port number to check.
 *
 * @returns True if port is free and false otherwise.
 */
function isPortFree(port: number) {
  return new Promise((resolve) => {
    const server = http.createServer()
      .listen(port, () => {
        server.close();
        resolve(true);
      })
      .on('error', () => {
        resolve(false);
      });
  });
}


/**
 * Tries to find a free port recursively.
 *
 * @param port Starting port number
 *
 * @returns Available port number or the next port nubmer to try.
 */
export async function tryPort(port = 3000): Promise<number> {
  if (await isPortFree(port)) {
    return port;
  }
  return tryPort(port + 1);
}

/**
 * Pings a url to check if it's up.
 *
 * @param url The url to ping.
 * @returns Url ping result promise.
 */
export function ping(url: string) {
  const promise = new Promise<boolean>((resolve) => {
    const useHttps = url.indexOf('https') === 0;
    const request = useHttps ? https.request : http.request;

    const pingRequest = request(url, () => {
      resolve(true);
      pingRequest.destroy();
    });

    pingRequest.on('error', () => {
      resolve(false);
      pingRequest.destroy();
    });

    pingRequest.write('');
    pingRequest.end();
  });

  return promise;
}

/**
 * Waits for a url to be pingable.
 *
 * @param url The url to ping.
 * @param interval The interval to wait between pings.
 * @param max The maximum amount of time to wait.
 *
 * @returns Url ping result promise.
 */
export async function waitFor(url: string, interval = 200, max = 30_000) {
  let time = Math.ceil(max / interval);
  while (time > 0) {
    time -= 1;
    if (await ping(url)) {
      return true;
    }
    await timeout(interval);
  }

  return false;
}