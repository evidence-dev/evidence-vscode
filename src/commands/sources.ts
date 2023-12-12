import { sendCommand } from '../terminal';
import { timeout } from '../utils/timer';
import { isServerRunning, startServer, stopServer } from './server';
import { isUSQL, getTypesFromConnections } from '../utils/jsonUtils';
import { telemetryService } from '../extension';
import { window } from 'vscode';

export async function runSources() {
  if(await isUSQL()){
    let serverRunning = false;
    if (isServerRunning()) {
      serverRunning = true;
      stopServer();
      await timeout(1000);
    }
    sendCommand(`npm run sources`);

    const sourceNames = await getTypesFromConnections();
  
    telemetryService.sendEvent('runSources', { sources: sourceNames.join(', ')});

    if(serverRunning){
      startServer();
    }
  } else {
    window.showErrorMessage('Run Sources is only available in Evidence versions >= 24');
  }
}

