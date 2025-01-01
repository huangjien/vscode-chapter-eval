import * as vscode from 'vscode';
import { SettingsWebViewProvider } from '../SettingsWebViewProvider';

export function setupSettingWebviewProvider(context: vscode.ExtensionContext) {
  const provider = new SettingsWebViewProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'vscodeChapterEval_settingsWebview',
      provider
    )
  );
}
