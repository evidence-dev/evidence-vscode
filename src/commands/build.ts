import { sendCommand } from '../terminal';

export function buildProject() {
  sendCommand('npm run build');
}
