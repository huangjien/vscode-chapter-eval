'use strict';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {
  showMessage,
  countChineseString,
  isMarkdownOrPlainText,
  getConfiguration,
  getAnalysisFolder,
  getFileName,
  showStatusBarProgress,
  printToOutput,
} from './Utils';
import OpenAI from 'openai';
import { readTextAloud, formatMarkdown, evaluateChapter } from './Functions';
// import {EvaluationWebViewProvider} from './EvaluationWebViewProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const storagePath = getAnalysisFolder(context);

  registerCommandOfShowExistedEvaluation(context, storagePath);
  // registerCommandOfShowEvaluation(context, storagePath);
  registerHoverProvider(storagePath);
  registerCommandOfEvaluation(storagePath, context);
  registerCommandOfReadOutLoud(context);
  registerCommandOfFormat(context);

  // 创建一个状态栏项
  setupStatusBarItem(context, storagePath);

  const provider = new EvaluationWebViewProvider(context);
  context.subscriptions.push(vscode.window.registerWebviewViewProvider('vscodeChapterEval_markdownWebview', provider))
}

function setupStatusBarItem(context: vscode.ExtensionContext, storagePath: string) {
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    400
  );
  statusBarItem.command = 'vscodeChapterEval.toggleStatusBar';
  statusBarItem.hide(); // 默认隐藏状态栏项

  context.subscriptions.push(statusBarItem);
  updateStatusBar(storagePath, statusBarItem);

  // 监听活动编辑器的变化
  vscode.window.onDidChangeActiveTextEditor(
    updateStatusBar(storagePath, statusBarItem),
    null,
    context.subscriptions
  );
  vscode.workspace.onDidSaveTextDocument(
    updateStatusBar(storagePath, statusBarItem),
    null,
    context.subscriptions
  );

  // 定义点击状态栏后显示的菜单
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'vscodeChapterEval.toggleStatusBar',
      async () => {
        const selectedOption = await vscode.window.showQuickPick(
          [
            'Evaluate Current Chapter',
            'Format Current Chapter',
            'Information of Current Chapter',
          ],
          { placeHolder: 'You can choose' }
        );
        if (selectedOption === 'Evaluate Current Chapter') {
          if (statusBarItem.text.startsWith('Evaluated')) {
            showMessage('Display existing evaluation...', 'info');
            
            // TODO logic to show existing evaluation
          } else {
            showMessage('Evaluating current document...', 'info');
            vscode.commands.executeCommand(
              'vscodeChapterEval.evaluateMarkdown'
            );
          }
        }
        if (selectedOption === 'Format Current Chapter') {
          vscode.commands.executeCommand('vscodeChapterEval.formatMarkdown');
        }
        if (selectedOption === 'Information of Current Chapter') {
          printToOutput(statusBarItem.tooltip!.toString());
        }
      }
    )
  );
}

function updateStatusBar(
  storagePath: string,
  statusBarItem: vscode.StatusBarItem
): (e: vscode.TextEditor | vscode.TextDocument | undefined) => any {
  return () => {
    const editor = vscode.window.activeTextEditor;
    if (editor && isMarkdownOrPlainText(editor)) {
      const documentText = editor.document.getText();
      const [text_length, non, invisible] = countChineseString(documentText);
      const source_file_stat = fs.lstatSync(editor.document.uri.fsPath);
      statusBarItem.tooltip =
        '🇨🇳 ' +
        text_length.toString() +
        ' 🔠' +
        non.toString() +
        '📃 ' +
        invisible.toString() +
        '\n🕗 ' +
        source_file_stat.mtime.toISOString().replace('T', ' ').replace('Z', '');
      const filename = getFileName(editor.document);

      const resultFilePath = path.join(storagePath, filename);
      if (fs.existsSync(resultFilePath)) {
        statusBarItem.text = 'Evaluated ✔️';
      } else {
        statusBarItem.text = 'Not Evaluated ⏳';
      }
      statusBarItem.show();
    } else {
      statusBarItem.hide();
    }
  };
}

function registerHoverProvider(storagePath: string) {
  vscode.languages.registerHoverProvider('markdown', {
    provideHover(document) {
      const filename = getFileName(document);
      const resultFilePath = path.join(storagePath, filename);
      if (fs.existsSync(resultFilePath)) {
        const tip = fs.readFileSync(resultFilePath).toString();
        return new vscode.Hover(tip);
      }
      return null;
    },
  });
}

function registerCommandOfShowEvaluation(
  context: vscode.ExtensionContext,
  storagePath: string
) {
  context.subscriptions.push(
    vscode.commands.registerCommand('vscodeChapterEval.showEvaluation', () => {
      return async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          showMessage('No open Markdown file.', 'info');
          return;
        }
        if (!isMarkdownOrPlainText(editor)) {
          showMessage('This is not a Markdown or Plaintext file.', 'info');
          return;
        }
        const filename = getFileName(editor.document);

        const resultFilePath = path.join(storagePath, filename);
        if (fs.existsSync(resultFilePath)) {
          const panel = vscode.window.createWebviewPanel(
            'vscodeChapterEval_markdownWebview',
            'Evaluation',
            { viewColumn: vscode.ViewColumn.One },
            { enableScripts: true }
          );
          const markdownText = fs.readFileSync(resultFilePath).toString();
          console.log(markdownText);
          panel.webview.html = getWebviewContent(markdownText);
        }
      };
    })
  );
}

function registerCommandOfShowExistedEvaluation(
  context: vscode.ExtensionContext,
  storagePath: string
) {
  context.subscriptions.push(
    // ctrl+f1, show existed evaluation
    vscode.commands.registerCommand(
      'vscodeChapterEval.showExistedEvaluation',
      () => {
        return async () => {
          const editor = vscode.window.activeTextEditor;
          if (!editor) {
            showMessage('No open Markdown file.', 'info');
            return;
          }
          if (!isMarkdownOrPlainText(editor)) {
            showMessage('This is not a Markdown or Plaintext file.', 'info');
            return;
          }
          let tip = 'No Evaluation Now.';
          const filename = getFileName(editor.document);

          const resultFilePath = path.join(storagePath, filename);
          if (fs.existsSync(resultFilePath)) {
            tip = fs.readFileSync(resultFilePath).toString();
          }
          return new vscode.Hover(tip);
        };
      }
    )
  );
}

function registerCommandOfFormat(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('vscodeChapterEval.formatMarkdown', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        showMessage('No open Markdown file.', 'info');
        return;
      }
      if (!isMarkdownOrPlainText(editor)) {
        showMessage('This is not a Markdown or Plaintext file.', 'info');
        return;
      }

      // Your formatting logic here
      const formattedText = formatMarkdown(editor.document.getText());
      vscode.window.activeTextEditor?.edit((builder) => {
        const doc = editor.document;
        builder.replace(
          new vscode.Range(
            doc.lineAt(0).range.start,
            doc.lineAt(doc.lineCount - 1).range.end
          ),
          formattedText
        );
      });
      return;
    })
  );
}

function registerCommandOfReadOutLoud(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('vscodeChapterEval.readOutLoud', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        showMessage('No open Markdown file.', 'info');
        return;
      }
      if (!isMarkdownOrPlainText(editor)) {
        showMessage('This is not a Markdown or Plaintext file.', 'info');
        return;
      }
      const text = editor.document.getText(editor.selection);
      if (text) {
        readTextAloud(text);
      } else {
        showMessage('No text selected', 'info');
      }
    })
  );
}

function registerCommandOfEvaluation(
  storagePath: string,
  context: vscode.ExtensionContext
) {
  const location: string = getConfiguration('modelLocation')!;
  const localModel: string = getConfiguration('localModel')!;
  const apiKey: string = getConfiguration('openaiApiKey')!;
  if (!apiKey && location === 'Remote') {
    showMessage('OpenAI API key is not set in settings.', 'error');
    return;
  }
  if (!localModel && location === 'Local') {
    showMessage('Local model is not set in settings.', 'error');
    return;
  }
  process.env.OPENAI_API_KEY = apiKey;
  let model: string = getConfiguration('model', 'gpt-4o-mini')!;

  const temperature: number = getConfiguration('temperature', 1)!;

  const maxToken: number = getConfiguration('maxToken', 4096)!;

  let openai: OpenAI;
  if (location === 'Remote') {
    openai = new OpenAI();
  } else {
    openai = new OpenAI({
      baseURL: 'http://localhost:11434/v1',
      apiKey: 'ollama', // required but unused
    });
    model = getConfiguration('localModel', 'llama3.1:latest')!;
  }

  const evaluator = vscode.commands.registerCommand(
    'vscodeChapterEval.evaluateMarkdown',
    async () => {
      const editor = vscode.window.activeTextEditor;
      console.log('before check editor');
      if (!editor) {
        showMessage('No open Markdown file.', 'info');
        return;
      }
      console.log('after check editor');
      if (!isMarkdownOrPlainText(editor)) {
        showMessage('This is not a Markdown or Plaintext file.', 'info');
        return;
      }

      let promptString: string = getConfiguration('prompt')!;
      if (!promptString) {
        showMessage('OpenAI prompt is not set!', 'warning');
        promptString = `You are ASSISTANT , work as literary critic. Please evaluate the tension of the following chapter and give it a score out of 100. 
            Also, describe the curve of the tension changes in the chapter. 
            Point out the three most outstanding advantages and the three biggest disadvantages of the chapter. 
            If you find any typographical errors, please point them out. 
            \n\nUSER: $PROMPT$ \n\nASSISTANT: `;
      }

      const longRunTask = evaluateChapter(
        openai,
        editor,
        storagePath,
        promptString,
        model,
        temperature,
        maxToken
      );
      showStatusBarProgress(longRunTask);
    }
  );
  context.subscriptions.push(evaluator);
}

function getWebviewContent(markdownText: string) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Chapter Evaluation</title>
      <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  </head>
  <body>
      <h1>Evaluation</h1>
      <div id="content">## Hello, Author!</div>

      <script>
          const content = document.getElementById('content');
          const markdownText = content.innerText;
          content.innerHTML = marked("${markdownText}");
      </script>
  </body>
  </html>
  `;
}

class EvaluationWebViewProvider implements vscode.WebviewViewProvider {
  constructor(private context: vscode.ExtensionContext) {}
  resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, token: vscode.CancellationToken): Thenable<void> | void {
      webviewView.webview.options = {
          enableScripts: true
      };
      webviewView.webview.html = this.getWebviewContent();

      webviewView.webview.onDidReceiveMessage(async (message) => {
          switch (message.command) {
              case "showEvaluation":
                  
                  break;
          
              default:
                  break;
          }
      })
  }
  getWebviewContent(): string {
      return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chapter Evaluation</title>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
</head>
<body>
    <h1>Evaluation</h1>
    <div id="content">## Hello, Author!</div>

    
</body>
</html>
`;;
  }
}
