'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as CryptoJS from 'crypto';
import OpenAI from 'openai';
import { exec } from 'child_process';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const storagePath = getAnalysisFolder(context);

  registerCommandOfShowExistedEvaluation(context, storagePath);
  registerCommandOfShowEvaluation(context, storagePath);
  registerHoverProvider(storagePath);
  registerCommandOfEvaluation(storagePath, context);
  registerCommandOfReadOutLoud(context);
  registerCommandOfFormat(context);

  // 创建一个状态栏项
  let statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    400
  );
  // let isEvaluated = false; // Placeholder for actual evaluation state storage
  // statusBarItem.text = isEvaluated ? 'Evaluated ✔️' : 'Not Evaluated ⏳';
  // statusBarItem.tooltip = 'Click to show options';
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
          ['Evaluate Current Chapter', 'Format Current Chapter', 'Information of Current Chapter'],
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
          showMessage(statusBarItem.tooltip!.toString(), 'info');
        }
      }
    )
  );
}

function countChineseChar(ch: string) {
  // Count chinese Chars
  let count = 0;
  const regexChineseChar = /[\u4E00-\u9FA5\uF900-\uFA2D]/;
  if (regexChineseChar.test(ch)) {
    return true;
  }
  return false;
}
function countChineseString(text: string) {
  let count = 0;
  let non = 0;
  let invisible = 0;
  for (let index = 0; index < text.length; index++) {
    const ch = text.charAt(index);
    if (countChineseChar(ch)) {
      count++;
    } else {
      non++;
      if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
        invisible++;
      }
    }
  }
  return [count, non, invisible];
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
        let tip = fs.readFileSync(resultFilePath).toString();
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
        let tip = 'No Evaluation Now.';
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

  let temperature: number = getConfiguration('temperature', 1)!;

  let maxToken: number = getConfiguration('maxToken', 4096)!;

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
      console.log("before check editor")
      if (!editor) {
        showMessage('No open Markdown file.', 'info');
        return;
      }
      console.log("after check editor")
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

function getAnalysisFolder(context: vscode.ExtensionContext) {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    const storagePath = context.globalStorageUri.fsPath;
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath, { recursive: true });
    }
    return storagePath;
  }
  const workspaceRoot = workspaceFolders[0].uri.fsPath;
  const a_path = path.join(workspaceRoot, 'Analysis');
  if (!fs.existsSync(a_path)) {
    fs.mkdirSync(a_path);
  }

  return a_path;
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

function readTextAloud(text: string) {
  const platform = process.platform;

  let command = '';
  switch (platform) {
    case 'win32':
      // Windows
      command =
        `powershell -Command "Add-Type -AssemblyName System.speech;` +
        `[System.Speech.Synthesis.SpeechSynthesizer]::new().Speak('${text.replace(/'/g, "''")}');"`;
      break;
    case 'darwin':
      // macOS
      command = `say "${text}"`;
      break;
    case 'linux':
      // Linux
      command = `espeak "${text}"`;
      break;
    default:
      showMessage('Unsupported platform', 'error');
      return;
  }

  exec(command, (error, stdout, stderr) => {
    if (error) {
      showMessage(`Error: ${error.message}`, 'error');
      return;
    }
    if (stderr) {
      showMessage(`stderr: ${stderr}`, 'error');
      return;
    }
    showMessage(`Text read out loud successfully`, 'info');
  });
}

function formatMarkdown(text: string): string {
  // Split the text into paragraphs
  const paragraphs = text.trim().split(/\n\s*\n/);

  // Process each paragraph
  const processedParagraphs = paragraphs.map((paragraph) => {
    // Trim whitespace
    paragraph = paragraph.trim();

    // Ensure spacing between English and Chinese characters
    // Regex explains: English to Chinese
    paragraph = paragraph.replace(/([a-zA-Z])([\u4e00-\u9fa5])/g, '$1 $2');
    // Chinese to English
    paragraph = paragraph.replace(/([\u4e00-\u9fa5])([a-zA-Z])/g, '$1 $2');

    // Add 2 spaces indentation
    paragraph = paragraph
      .split('\n')
      .map((line) => line)
      .join('\n');

    return '　　' + paragraph;
  });

  // Reassemble the paragraphs, ensuring an empty line between each
  return '　　\n\n' + processedParagraphs.join('\n\n');
}

function showStatusBarProgress(task: Promise<any>) {
  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Processing...',
      cancellable: true, // Set to true if you want to allow cancelling the task
    },
    () => {
      return task; // The progress UI will show until this Promise resolves
    }
  );
}

async function evaluateChapter(
  openai: OpenAI,
  editor: vscode.TextEditor,
  storagePath: string,
  promptString: string,
  model: string,
  temperature: number,
  maxToken: number
) {
  // get file base info, and chars number
  if (editor.document.isDirty) {
    showMessage(
      'Please save your file before evaluation, or you may just waste your money!',
      'warning'
    );
    return;
  }
  const source_file_uri = editor.document.uri;
  const source_file_stat = fs.lstatSync(source_file_uri.fsPath);
  const filename = getFileName(editor.document);

  const documentText = editor.document.getText();
  const text_length = documentText.length;
  // Proceed to evaluate the documentText with OpenAI and handle the result
  // calculate its hash, if we have done that before, it will be save in your local disk, just read from there
  const stringHash = digest(documentText);
  const resultFilePath = path.join(storagePath, filename);
  promptString = promptString.replace('$PROMPT$', documentText);
  // if file already existed, check its first 8 chars,
  // if matched, then we have done the evaluation, just display it.
  // if not matched, need to do evaluation again.
  let exist_content = '';
  if (fs.existsSync(resultFilePath)) {
    const content = fs.readFileSync(resultFilePath).toString();
    if (content.startsWith(stringHash)) {
      displayMarkdownFromFile(resultFilePath);
      return;
    }
    exist_content = '\n\n---\n\n' + content;
  }

  // does not exist, call openAi to make it.

  await openai.chat.completions
    .create({
      model: model,
      messages: [{ role: 'user', content: promptString }],
      temperature: temperature,
      max_tokens: maxToken,
    })
    .then((data) => {
      return JSON.stringify(data);
    })
    .then((data) => {
      const evalContent = JSON.parse(data);
      writeToLocal(
        resultFilePath,
        stringHash +
          '\n\nLength: ' +
          text_length +
          '\n\nLast Modified: ' +
          source_file_stat.mtime.toISOString().replace('T', ' ').replace('Z', '') +
          '\n\n<details><summary>' +
          source_file_stat.mtime.toISOString().replace('T', ' ').replace('Z', '') +
          '</summary><br/>' +
          evalContent.choices[0]['message']['content'] +
          '</details>' +
          exist_content
      );
    })
    .catch((err) => {
      showMessage(err.message, 'error');
    });

  if (fs.existsSync(resultFilePath)) {
    displayMarkdownFromFile(resultFilePath);
  }
  return promptString;
}

function getFileName(document: vscode.TextDocument) {
  return document.fileName.split('\\')?.pop()?.split('/')?.pop()!;
}

// this method is called when your extension is deactivated
export function deactivate() {}

export function showMessage(
  message: string,
  type: 'info' | 'warning' | 'error'
) {
  switch (type) {
    case 'info':
      vscode.window.showInformationMessage(message);
      break;
    case 'warning':
      vscode.window.showWarningMessage(message);
      break;
    case 'error':
      vscode.window.showErrorMessage(message);
      break;
  }
}

export function displayMarkdownFromFile(filePath: string) {
  const uri = vscode.Uri.file(filePath);
  // vscode.commands.executeCommand('markdown.showPreview', uri);
  vscode.commands.executeCommand('vscodeChapterEval.showEvaluation', uri);
}

export function isMarkdownOrPlainText(editor: vscode.TextEditor) {
  return (
    editor.document.languageId === 'markdown' ||
    editor.document.languageId === 'plaintext'
  );
}

export function printToOutput(result: string) {
  // Create an output channel (if it doesn't exist already) and get a reference to it
  const outputChannel = vscode.window.createOutputChannel('Chapter Evaluation');

  // Clear any previous content in the output channel
  outputChannel.clear();

  // Write the result to the output channel
  outputChannel.appendLine(result);

  // Bring the Output window into focus with our output channel visible
  outputChannel.show(true); // Pass `true` to preserve focus on the editor
}

export function digest(message: string) {
  return CryptoJS.createHash('sha1')
    .update(message.replace(/\s/g, '').replace('　', ''), 'utf8')
    .digest('hex')
    .substring(0, 8);
}

export function writeToLocal(fileName: string, fileContent: string): string {
  // if file already existed, get its content, append to the end of fileContent
  //   let writeContent = fileContent;
  //   if (fs.existsSync(fileName)) {
  //     writeContent = fileContent + "\n\n---\n\n" +fs.readFileSync(fileName).toString();
  //   }
  fs.writeFileSync(fileName, fileContent, 'utf8');
  showMessage(`Evaluation result saved to ${fileName}`, 'info');
  return fileName;
}

function getConfiguration(key: string, defaultValue?: any) {
  return vscode.workspace
    .getConfiguration('vscodeChapterEval')
    .get(key, defaultValue);
}
