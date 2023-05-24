import { sendCommand } from '../terminal';

export function startServer() {
  sendCommand('npm run dev');
}

export function stopServer() {
  sendCommand('\x03', '', false); // shift focus to terminal
  //sendCommand('q', '', false);
}
