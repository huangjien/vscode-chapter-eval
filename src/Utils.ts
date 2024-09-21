import * as CryptoJS from 'crypto';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as l10n from '@vscode/l10n';

export function digest(message: string) {
  return CryptoJS.createHash('sha1')
    .update(message.replace(/\s/g, '').replace('　', ''), 'utf8')
    .digest('hex')
    .substring(0, 8);
}

export function writeToLocal(fileName: string, fileContent: string): string {
  fs.writeFileSync(fileName, fileContent, 'utf8');
  showMessage(l10n.t('saveResult', fileName), 'info');
  return fileName;
}

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

export function countChineseChar(ch: string) {
  // Count chinese Chars
  const regexChineseChar = /[\u4E00-\u9FA5\uF900-\uFA2D]/;
  if (regexChineseChar.test(ch)) {
    return true;
  }
  return false;
}
export function countChineseString(text: string) {
  let count = 0;
  let non = 0;
  let invisible = 0;
  for (let index = 0; index < text.length; index++) {
    const ch = text.charAt(index);
    if (countChineseChar(ch)) {
      count++;
    } else {
      non++;
      if (
        ch === ' ' ||
        ch === '\t' ||
        ch === '\n' ||
        ch === '\r' ||
        ch === '　'
      ) {
        invisible++;
      }
    }
  }
  return [count, non, invisible];
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

export function getConfiguration(key: string, defaultValue?: any) {
  return vscode.workspace
    .getConfiguration('vscodeChapterEval')
    .get(key, defaultValue);
}

export function getAnalysisFolder(context: vscode.ExtensionContext) {
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

export function getFileName(document: vscode.TextDocument) {
  return document.fileName.split('\\')!.pop()!.split('/')!.pop()!;
}

// this method is called when your extension is deactivated
export function deactivate() {}

export function displayMarkdownFromFile(filePath: string) {
  const uri = vscode.Uri.file(filePath);
  // vscode.commands.executeCommand('markdown.showPreview', uri);
  vscode.commands.executeCommand('vscodeChapterEval.showEvaluation', uri);
}

export function showStatusBarProgress(task: Promise<any>): void {
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
