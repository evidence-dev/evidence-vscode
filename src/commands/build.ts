import { sendCommand } from '../terminal';

/**
 * Installs Evidence app NodeJS dependencies.
 *
 * @see https://docs.evidence.dev/getting-started/install-evidence
 */
export function installDependencies() {
  sendCommand('npm install');
}

/**
 * Builds Evidence project for deployment.
 *
 * @see https://docs.evidence.dev/deployment/overview#build-process
 */
export function buildProject() {
  sendCommand('npm run build');
}

/**
 * Builds Evidence project in a strict mode.
 *
 * @see https://docs.evidence.dev/deployment/overview#buildstrict
 */
export function buildProjectStrict() {
  sendCommand('npm run build:strict');
}
