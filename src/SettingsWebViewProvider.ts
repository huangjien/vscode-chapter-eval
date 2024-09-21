import * as vscode from 'vscode';
import * as l10n from '@vscode/l10n';

export class SettingsWebViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'webView';
  public _view?: vscode.WebviewView;
  constructor(private context: vscode.ExtensionContext) {}
  resolveWebviewView(webviewView: vscode.WebviewView): Thenable<void> | void {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
    };
    webviewView.webview.html = this.getWebviewContent();
  }

  getWebviewContent(): string {
    const all = vscode.workspace.getConfiguration('vscodeChapterEval');
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${l10n.t('vscodeChapterEval_settingsWebview.contextualTitle')}</title>
  </head>
  <body>
    <ul >
      <li><p>${l10n.t('vscodeChapterEval.modelLocation.title')}: <b>${all.modelLocation}</b></p></li>
      <li><p>${l10n.t('vscodeChapterEval.localModel.title')}: <b>${all.localModel}</b></p></li>
      <li><p>${l10n.t('vscodeChapterEval.model.title')}: <b>${all.model}</b></p></li>
      <li><p>${l10n.t('vscodeChapterEval.temperature')}: <b>${all.temperature}</b></p></li>
      <li><p>${l10n.t('vscodeChapterEval.prompt.title')}: <br /><b>${all.prompt}</b></p></li>
    </ul>
  </body>
  </html>
  `;
  }
}
