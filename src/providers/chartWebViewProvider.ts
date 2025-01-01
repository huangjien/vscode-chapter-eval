import * as vscode from 'vscode';
import { getNonce, getUri } from '../Utils';

export function setupChartWebviewProvider(context: vscode.ExtensionContext) {
  const provider = new ChartWebViewProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'vscodeChapterEval_chartWebview',
      provider
    )
  );
  return provider;
}
export class ChartWebViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'webView';
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
      'dist',
      'extension.css',
    ]);
    this.webviewUri = getUri(webviewView.webview, this.context.extensionUri, [
      'dist',
      'extension.js',
    ]);
    webviewView.webview.html = this.getWebviewContent(
      webviewView.webview,
      this.stylesUri,
      [],
      [],
      []
    );
  }

  public updateContent(event: any, tension: any, emotion: any): void {
    this._view!.webview!.html = this.getWebviewContent(
      this._view!.webview,
      this.stylesUri!,
      event,
      tension,
      emotion
    );
  }

  getWebviewContent(
    webview: vscode.Webview,
    stylesUri: vscode.Uri,
    event: string[],
    tension: number[],
    emotion: number[]
  ): string {
    const events = event.map((item) => "'" + item.replace(/,/g, '') + "'");
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <title>Tension and Emotion Chart</title>
  </head>
  <body>
      <canvas id="Chart" width="400" height="200"></canvas>
      <script>
        const ctx = document.getElementById('Chart').getContext('2d');
        const labels = [${events}];
        const tensions = [${tension}];
        const emotions = [${emotion}];
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Tension',
                        data: tensions,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)', // 填充颜色
                        borderWidth: 2,
                        backgroundColor: 'rgba(54, 162, 235, 0.2)', // 填充颜色
                        fill: true,
                        tension: 0.4, // 平滑曲线
                    },
                    {
                        label: 'Emotion',
                        data: emotions,
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 2,
                        fill: false,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Events',
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Value',
                        },
                        min: -1,
                        max: 1,
                    },
                },
            },
        });
    </script>
  </body>
  </html>
  `;
  }
}
