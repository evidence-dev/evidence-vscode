import * as fs from 'fs';
import * as path from 'path';
import {
  workspace
} from 'vscode';
import TelemetryReporter from '@vscode/extension-telemetry';

export class TelemetryService {
  private reporter: TelemetryReporter;
  private commonProperties: { [key: string]: string } = {};

  constructor(key: string) {
      this.reporter = new TelemetryReporter(key);
      this.loadCommonProperties();
  }

  private loadCommonProperties() {
      const profilePath = path.join(workspace.rootPath || '', '.evidence', 'template', '.profile.json');
      try {
          if (fs.existsSync(profilePath)) {
              const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
              if (profile) {
                  if (profile.anonymousId) {
                      this.commonProperties['profileID'] = profile.anonymousId;
                  }
                  if (profile.traits && profile.traits.projectCreated) {
                      this.commonProperties['profileProjectCreated'] = profile.traits.projectCreated;
                  }
              }
          }
      } catch (error) {
          // Fail silently. Possibly send failure event in the future
      }
  }

  public sendEvent(eventName: string, properties?: { [key: string]: string }, measurements?: { [key: string]: number }) {
      const eventProperties = { ...this.commonProperties, ...properties };
      this.reporter.sendTelemetryEvent(eventName, eventProperties, measurements);
  }

  public dispose() {
      this.reporter.dispose();
  }
}