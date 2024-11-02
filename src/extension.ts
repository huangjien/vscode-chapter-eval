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
  getOrCreateAnalysisFolder,
} from './Utils';
import OpenAI from 'openai';
import {
  readTextAloud,
  formatMarkdown,
  evaluateChapter,
  sortAndRenameFiles,
  appendToLog,
  countChineseCharactersInDirectory,
  generateCSVReport,
  mergeMarkdownAndGeneratePDF,
  callAI,
} from './Functions';
import { EvaluationWebViewProvider } from './EvaluationWebViewProvider';
import { SettingsWebViewProvider } from './SettingsWebViewProvider';
import { CandidateWebViewProvider } from './CandidateWebViewProvider';
import * as l10n from '@vscode/l10n';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  setupL10N(context);

  const location: string = getConfiguration('modelLocation')!;
  const localModel: string = getConfiguration('localModel')!;
  const apiKey: string = getConfiguration('openaiApiKey')!;
  if (!apiKey && location === 'Remote') {
    showMessage(
      l10n.t('keyNotSet'), // Model API key is not set in settings.
      'error'
    );
    return;
  }
  if (!localModel && location === 'Local') {
    showMessage(
      l10n.t('localModelNotSet', 'Local model is not set in settings.'),
      'error'
    );
    return;
  }
  process.env.OPENAI_API_KEY = apiKey;
  let model: string = getConfiguration('model', 'gpt-4o-mini')!;

  const temperature: number = getConfiguration('temperature', 1)!;

  let promptString: string = getConfiguration('prompt')!;
  if (!promptString) {
    showMessage(l10n.t('promptNotSet', 'OpenAI prompt is not set!'), 'warning');
    promptString = `You are ASSISTANT , work as literary critic. Please evaluate the tension of the following chapter and give it a score out of 100. 
            Also, describe the curve of the tension changes in the chapter. 
            Point out the three most outstanding advantages and the three biggest disadvantages of the chapter. 
            If you find any typographical errors, please point them out. 
            \n\nUSER: $PROMPT$ \n\nASSISTANT: `;
  }

  let update_promptString: string = getConfiguration('update_prompt')!;
  if (!update_promptString) {
    showMessage(
      l10n.t('promptNotSet', 'OpenAI update prompt is not set!'),
      'warning'
    );
    update_promptString = `You are an editor. Please update below sentences, to make them more attractive, readable and natrural. \nUSER: $PROMPT$ \nASSISTANT:`;
  }

  let openai: OpenAI;
  if (location === 'Remote') {
    openai = new OpenAI();
  } else {
    openai = new OpenAI({
      baseURL: 'http://localhost:11434/v1',
      apiKey: 'ollama', // required but unused
    });
    model = getConfiguration('localModel', 'qwen2.5:latest')!;
  }

  registerCommandOfShowExistedEvaluation(context);
  registerHoverProvider();
  registerCommandOfEvaluation(
    context,
    openai,
    model,
    promptString,
    temperature
  );
  registerCommandOfReadOutLoud(context);
  registerCommandOfFormat(context);
  registerCommandOfSortAndRename(context);
  setupStatusBarItem(context);
  registerCommandOfSummaryOfToday(context);
  registerCommandOfGeneratePDF(context);

  const evaluationProvider = setupSidebarWebviewProvider(context);
  registerCommandOfShowEvaluation(context, evaluationProvider);
  setupSettingWebviewProvider(context);
  const updateProvider = setupCandidateWebviewProvider(context);
  registerCommandOfUpdateCandidate(
    context,
    updateProvider,
    openai,
    model,
    update_promptString,
    temperature
  );
}

function setupL10N(context: vscode.ExtensionContext) {
  const locale = vscode.env.language;
  l10n.config({
    fsPath: path.join(
      context.extensionPath,
      'l10n',
      'bundle.l10n.' + locale + '.json'
    ),
  });
}

function setupSettingWebviewProvider(context: vscode.ExtensionContext) {
  const provider = new SettingsWebViewProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'vscodeChapterEval_settingsWebview',
      provider
    )
  );
}

function setupCandidateWebviewProvider(context: vscode.ExtensionContext) {
  const provider = new CandidateWebViewProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'vscodeChapterEval_candidateWebview',
      provider
    )
  );
  return provider;
}

function setupSidebarWebviewProvider(context: vscode.ExtensionContext) {
  const provider = new EvaluationWebViewProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'vscodeChapterEval_markdownWebview',
      provider
    )
  );
  vscode.commands.executeCommand('vscodeChapterEval.showEvaluation');
  return provider;
}

function registerCommandOfUpdateCandidate(
  context: vscode.ExtensionContext,
  updateProvider: CandidateWebViewProvider,
  openai: OpenAI,
  model: string,
  update_promptString: string,
  temperature: number
) {
  context.subscriptions.push(
    vscode.commands.registerCommand('vscodeChapterEval.updateSelected', () => {
      console.log('updateCandidate');
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        showMessage(
          l10n.t('noOpenMarkdownFile'), // No open Markdown file.
          'info'
        );
        return;
      }
      if (!isMarkdownOrPlainText(editor)) {
        showMessage(
          l10n.t('notMarkdownFile'), // Not a Markdown file.
          'info'
        );
        return;
      }
      const selection = editor.document.getText(editor.selection);
      const documentText = editor.document.getText();
      
      if (!selection) {
        showMessage(
          l10n.t('noTextSelect'), // No selection.
          'info'
        );
        return;
      } else {
        // Get the current editor's selected text, context (up and down)
        // send to AI to get the 3 updated version
        // display them in the sidebar
        const prompt = update_promptString.replace('$PROMPT$', selection).replace('$CONTEXT$', documentText);
        const longRunTask = callAI(openai, model, prompt, temperature).then(
          (data) => {
            const evalContent = JSON.parse(data);
            const result = `
\n\n### Model: ${evalContent.model}
\n\n### Prompt Token Size: ${evalContent.usage['prompt_tokens']} 
\n\n### Completion Token Size: ${evalContent.usage['completion_tokens']}  
\n\n### Total Token Size: ${evalContent.usage['total_tokens']}
\n\n
\`\`\`
${evalContent.choices[0]['message']['content']}           
\`\`\`            
`;
            updateProvider.updateContent(result);
          }
        );
        showStatusBarProgress(longRunTask);
      }
    })
  );
}

function registerCommandOfShowEvaluation(
  context: vscode.ExtensionContext,
  provider: EvaluationWebViewProvider
) {
  const storagePath = getAnalysisFolder();
  if (!storagePath) {
    return;
  }
  context.subscriptions.push(
    vscode.commands.registerCommand('vscodeChapterEval.showEvaluation', () => {
      if (provider._view) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          return;
        }
        vscode.commands.executeCommand(
          'vscodeChapterEval_markdownWebview.focus'
        );
        const filename = getFileName(editor.document);
        const resultFilePath = path.join(storagePath, filename);
        if (fs.existsSync(resultFilePath)) {
          const text = fs.readFileSync(resultFilePath).toString();
          provider.updateContent(text);
        }
      }
    })
  );
}

function setupStatusBarItem(context: vscode.ExtensionContext) {
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    400
  );
  statusBarItem.command = 'vscodeChapterEval.toggleStatusBar';
  statusBarItem.hide(); // by default, hide statusBar
  const storagePath = getAnalysisFolder();
  if (!storagePath) {
    return;
  }
  context.subscriptions.push(statusBarItem);
  updateStatusBar(storagePath, statusBarItem);

  // Monitor editor status
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
  vscode.workspace.onDidOpenTextDocument(
    updateStatusBar(storagePath, statusBarItem),
    null,
    context.subscriptions
  );

  // define menu after click statusBar
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'vscodeChapterEval.toggleStatusBar',
      async () => {
        const selectedOption = await vscode.window.showQuickPick(
          [
            l10n.t('evaluateCurrent'), //Evaluate Current Chapter
            l10n.t('formatCurrent'), //Format Current Chapter
            l10n.t('infoCurrent'), // Information of Current Chapter
          ],
          { placeHolder: 'You can choose' }
        );
        if (selectedOption === l10n.t('evaluateCurrent')) {
          if (statusBarItem.text.startsWith(l10n.t('evaluated'))) {
            showMessage(
              l10n.t('displayEvaluation'), // Display existing evaluation...
              'info'
            );
            vscode.commands.executeCommand('vscodeChapterEval.showEvaluation');
          } else {
            showMessage(
              l10n.t('evaluateDocument'), // Evaluating current document...
              'info'
            );
            vscode.commands.executeCommand(
              'vscodeChapterEval.evaluateMarkdown'
            );
          }
        }
        if (selectedOption === l10n.t('formatCurrent')) {
          vscode.commands.executeCommand('vscodeChapterEval.formatMarkdown');
        }
        if (selectedOption === l10n.t('infoCurrent')) {
          printToOutput(statusBarItem.tooltip!.toString());
        }
      }
    )
  );
}

function updateStatusBar(
  storagePath: string,
  statusBarItem: vscode.StatusBarItem
): (e: vscode.TextEditor | vscode.TextDocument | undefined) => void {
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
        statusBarItem.text = l10n.t('evaluated') + ' ✔️';
        vscode.commands.executeCommand('vscodeChapterEval.showEvaluation');
      } else {
        statusBarItem.text = l10n.t('notEvaluated') + ' ⏳';
      }
      statusBarItem.show();
    } else {
      statusBarItem.hide();
    }
  };
}

function registerHoverProvider() {
  const storagePath = getAnalysisFolder();
  if (!storagePath) {
    return;
  }
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

function registerCommandOfSummaryOfToday(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'vscodeChapterEval.summaryOfToday',
      async (...commandArgs) => {
        if (commandArgs.length <= 0) {
          showMessage(l10n.t('noFolderSelected'), 'info');
          return;
        }
        const currentFolder = commandArgs[0].fsPath;
        const stats = countChineseCharactersInDirectory(currentFolder);
        vscode.window.showInformationMessage(
          `Total Chinese characters: ${stats.totalCount}`
        );

        // Generate CSV report
        generateCSVReport(stats, path.join(currentFolder, 'report.csv'));

        // Append to log
        appendToLog(stats, path.join(currentFolder, 'log.csv'));

        return;
      }
    )
  );
}

function registerCommandOfGeneratePDF(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'vscodeChapterEval.generatePDF',
      async (...commandArgs) => {
        if (commandArgs.length <= 0) {
          showMessage(l10n.t('noFolderSelected'), 'info');
          return;
        }
        const currentFolder = commandArgs[0].fsPath;

        mergeMarkdownAndGeneratePDF(currentFolder, currentFolder + '.pdf');

        return;
      }
    )
  );
}

function registerCommandOfShowExistedEvaluation(
  context: vscode.ExtensionContext
) {
  context.subscriptions.push(
    // ctrl+f1, show existed evaluation
    vscode.commands.registerCommand(
      'vscodeChapterEval.showExistedEvaluation',
      () => {
        return async () => {
          const editor = vscode.window.activeTextEditor;
          if (!editor) {
            showMessage(
              l10n.t('noOpenMarkdownFile'), // No open Markdown file.
              'info'
            );
            return;
          }
          if (!isMarkdownOrPlainText(editor)) {
            showMessage(l10n.t('notMarkdown'), 'info');
            return;
          }
          let tip = l10n.t('noEvaluationNow');
          const filename = getFileName(editor.document);
          const storagePath = getAnalysisFolder();
          if (!storagePath) {
            return;
          }

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
        showMessage(
          l10n.t('noOpenMarkdownFile'), // No open Markdown file.
          'info'
        );
        return;
      }
      if (!isMarkdownOrPlainText(editor)) {
        showMessage(
          l10n.t('notMarkdown'), // This is not a Markdown or Plaintext file.
          'info'
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

function registerCommandOfSortAndRename(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'vscodeChapterEval.sortAndRenameFiles',
      async (...commandArgs) => {
        if (commandArgs.length <= 0) {
          showMessage(l10n.t('noFolderSelected'), 'info');
          return;
        }
        const currentFolder = commandArgs[0].fsPath;
        sortAndRenameFiles(currentFolder);

        return;
      }
    )
  );
}

function registerCommandOfReadOutLoud(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('vscodeChapterEval.readOutLoud', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        showMessage(
          l10n.t('noOpenMarkdownFile'), // No open Markdown file.
          'info'
        );
        return;
      }
      if (!isMarkdownOrPlainText(editor)) {
        showMessage(
          l10n.t('notMarkdown'), // This is not a Markdown or Plaintext file.
          'info'
        );
        return;
      }
      const text = editor.document.getText(editor.selection);
      if (text) {
        readTextAloud(text);
      } else {
        showMessage(l10n.t('noTextSelect'), 'info'); // No text selected
      }
    })
  );
}

function registerCommandOfEvaluation(
  context: vscode.ExtensionContext,
  openai: OpenAI,
  promptString: string,
  model: string,
  temperature: number
) {
  const evaluator = vscode.commands.registerCommand(
    'vscodeChapterEval.evaluateMarkdown',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        showMessage(
          l10n.t('noOpenMarkdownFile', 'No open Markdown file.'),
          'info'
        );
        return;
      }
      if (!isMarkdownOrPlainText(editor)) {
        showMessage(
          l10n.t('notMarkdown', 'This is not a Markdown or Plaintext file.'),
          'info'
        );
        return;
      }

      const storagePath = getOrCreateAnalysisFolder(context);
      const longRunTask = evaluateChapter(
        openai,
        editor,
        storagePath,
        promptString,
        model,
        temperature
      );
      showStatusBarProgress(longRunTask);
    }
  );
  context.subscriptions.push(evaluator);
}
