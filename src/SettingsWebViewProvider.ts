import * as vscode from 'vscode';

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
    <title>Settings</title>

  </head>
  <body>
    <ul >
        <li><p>Remote or Local: <b>${all.modelLocation}</b></p></li>
        <li><p>Local Model: <b>${all.localModel}</b></p></li>
        <li><p>Model Name: <b>${all.model}</b></p></li>
        <li><p>Temperature: <b>${all.temperature}</b></p></li>
        <li><p>Prompt: <br /><b>${all.prompt}</b></p></li>
    </ul>
  </body>
  </html>
  `;
  }
}
