import * as vscode from "vscode";
import * as l10n from "@vscode/l10n";
import { marked } from "marked";
import { getNonce, getUri } from "../Utils";

export function setupCandidateWebviewProvider(
  context: vscode.ExtensionContext
) {
  const provider = new CandidateWebViewProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "vscodeChapterEval_candidateWebview",
      provider
    )
  );
  return provider;
}
export class CandidateWebViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "webView";
  public _view?: vscode.WebviewView;
  public webviewUri: vscode.Uri | undefined;
  public stylesUri: vscode.Uri | undefined;
  public nonce = getNonce();
  constructor(private context: vscode.ExtensionContext) {}
  resolveWebviewView(webviewView: vscode.WebviewView): Thenable<void> | void {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
    };
    this.stylesUri = getUri(webviewView.webview, this.context.extensionUri, [
      "dist",
      "extension.css",
    ]);
    this.webviewUri = getUri(webviewView.webview, this.context.extensionUri, [
      "dist",
      "extension.js",
    ]);
    webviewView.webview.html = this.getWebviewContent(
      webviewView.webview,
      this.stylesUri
    );
  }

  public updateContent(markdownText: string): void {
    this._view!.webview!.html = this.getWebviewContent(
      this._view!.webview,
      this.stylesUri!,
      markdownText
    );
  }

  getWebviewContent(
    webview: vscode.Webview,
    stylesUri: vscode.Uri,
    markdownText: string = ""
  ): string {
    const htmlContent = marked(markdownText)!;
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Security-Policy" content="default-src 'self';
    style-src ${webview.cspSource} 'unsafe-inline';
    script-src 'self' ${webview.cspSource};
    img-src ${webview.cspSource} https:;
    font-src ${webview.cspSource};
    style-src-elem 'self' ${webview.cspSource} 'unsafe-inline';">

    <link rel="stylesheet" href="${stylesUri}">
      <title>${l10n.t("vscodeChapterEval_candidateWebview.contextualTitle")}</title>
  </head>
  <body>
      <div id="content">${htmlContent}</div>
  </body>
  </html>
  `;
  }
}
