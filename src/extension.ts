'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';

import { formatMarkdown, showStatusBarProgress, generatePDF } from './Utils';
import { evaluateChapter } from './Utils';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const storagePath = context.globalStorageUri.fsPath;
  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
  }
  const location: string = vscode.workspace
    .getConfiguration('vscodeChapterEval')
    .get('modelLocation')!;
  const localModel: string = vscode.workspace
    .getConfiguration('vscodeChapterEval')
    .get('localModel')!;
  const apiKey: string = vscode.workspace
    .getConfiguration('vscodeChapterEval')
    .get('openaiApiKey')!;
  if (!apiKey && location === 'Remote') {
    vscode.window.showErrorMessage('OpenAI API key is not set in settings.');
    return;
  }
  if (!localModel && location === 'Local') {
    vscode.window.showErrorMessage('Local model is not set in settings.');
    return;
  }
  process.env.OPENAI_API_KEY = apiKey;
  var model: string = vscode.workspace
    .getConfiguration('vscodeChapterEval')
    .get('model')!;
  if (!model) {
    model = 'gpt-4-turbo';
  }

  var temperature: number = vscode.workspace
    .getConfiguration('vscodeChapterEval')
    .get('temperature')!;
  if (!temperature) {
    temperature = 1;
  }

  var maxToken: number = vscode.workspace
    .getConfiguration('vscodeChapterEval')
    .get('maxToken')!;
  if (!maxToken) {
    maxToken = 4096;
  }

  var openai: OpenAI;
  if (location === 'Remote') {
    openai = new OpenAI();
  } else {
    openai = new OpenAI({
      baseURL: 'http://localhost:11434/v1',
      apiKey: 'ollama', // required but unused
    });
    model = vscode.workspace
      .getConfiguration('vscodeChapterEval')
      .get('localModel')!;
    if (!model) {
      model = 'llama3';
    }
  }

  vscode.languages.registerHoverProvider('markdown', {
    provideHover(document, position, token) {
      // only when hover at the beginning of the chapter, will show tooltip
      if (position.line > 0 && position.character > 0) {
        return;
      }
      var tip = 'No Evaluation Now.';
      var filename = document.fileName.split('\\').pop()?.split('/').pop()!;

      const resultFilePath = path.join(storagePath, filename);
      if (fs.existsSync(resultFilePath)) {
        tip = fs.readFileSync(resultFilePath).toString();
      }
      return new vscode.Hover(tip);
    },
  });

  let evaluator = vscode.commands.registerCommand(
    'vscodeChapterEval.evaluateMarkdown',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage('No open Markdown file.');
        return;
      }
      if (
        editor.document.languageId != 'markdown' &&
        editor.document.languageId != 'plaintext'
      ) {
        vscode.window.showInformationMessage(
          'This is not a Markdown or Plaintext file.'
        );
        return;
      }

      let promptString: string = vscode.workspace
        .getConfiguration('vscodeChapterEval')
        .get('prompt')!;
      if (!promptString) {
        vscode.window.showWarningMessage('OpenAI prompt is not set!');
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
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'vscodeChapterEval.generatePDF',
      (uri: vscode.Uri) => {
        vscode.window.showInformationMessage(`PDF Generated on ${uri.fsPath}`);
      }
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'vscodeChapterEval.generateWordsCloud',
      (uri: vscode.Uri) => {
        // vscode.window.showInformationMessage(
        //   `Words Cloud Generated on ${uri.fsPath}`
        // );
        if (uri) {
          try {
            generatePDF(uri.fsPath);
          } catch (err) {
            vscode.window.showErrorMessage(
              'PDF generate from ' + uri.fsPath + ' failed:\n${err.message}'
            );
          }
        }
      }
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('vscodeChapterEval.formatMarkdown', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage('No open Markdown file.');
        return;
      }
      if (
        editor.document.languageId != 'markdown' &&
        editor.document.languageId != 'plaintext'
      ) {
        vscode.window.showInformationMessage(
          'This is not a Markdown or Plaintext file.'
        );
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

// this method is called when your extension is deactivated
export function deactivate() {}
