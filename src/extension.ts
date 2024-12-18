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
import { ChartWebViewProvider } from './ChartWebViewProvider';
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

  let evaluate_promptString: string = getConfiguration('prompt')!;
  let update_promptString: string = getConfiguration('update_prompt')!;
  let cliche_promptString: string = getConfiguration('cliche_prompt')!;
  let chart_promptString: string = getConfiguration('chart_prompt')!;

  // if in current workspace root, there is prompt folder, then find the prompts in there and replace the one from settings.
  ({
    evaluate_promptString,
    update_promptString,
    cliche_promptString,
    chart_promptString,
  } = getPromptStringFromWorkspaceFolder(
    evaluate_promptString,
    update_promptString,
    cliche_promptString,
    chart_promptString
  ));

  if (!evaluate_promptString) {
    // showMessage(l10n.t('promptNotSet', 'OpenAI prompt is not set!'), 'warning');
    evaluate_promptString = `You are ASSISTANT , work as literary critic. Please evaluate the tension of the following chapter and give it a score out of 100. 
            Also, describe the curve of the tension changes in the chapter. 
            Point out the three most outstanding advantages and the three biggest disadvantages of the chapter. 
            If you find any typographical errors, please point them out. 
            \n\nUSER: $PROMPT$ \n\nASSISTANT: `;
  }

  if (!update_promptString) {
    showMessage(
      l10n.t('promptNotSet', 'OpenAI update prompt is not set!'),
      'warning'
    );
    update_promptString = `You are an editor. Please update below sentences, to make them more attractive, readable and natrural. \nUSER: $PROMPT$ \nASSISTANT:`;
  }

  if (!cliche_promptString) {
    showMessage(
      l10n.t('promptNotSet', 'OpenAI update prompt is not set!'),
      'warning'
    );
    cliche_promptString = `You are an editor. Please update below sentences, to make them more attractive, readable and natrural. \nUSER: $PROMPT$ \nASSISTANT:`;
  }

  if (!chart_promptString) {
    showMessage(
      l10n.t('promptNotSet', 'OpenAI update prompt is not set!'),
      'warning'
    );
    chart_promptString = `You are an editor. Please update below sentences, to make them more attractive, readable and natrural. \nUSER: $PROMPT$ \nASSISTANT:`;
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
    evaluate_promptString,
    model,
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
  const chartProvider = setupChartWebviewProvider(context);
  registerCommandOfGenerateChart(
    context,
    chartProvider,
    openai,
    model,
    chart_promptString,
    temperature
  );
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
  const provider = new ChapterDecorationProvider();
  context.subscriptions.push(
    vscode.window.registerFileDecorationProvider(provider)
  );
}

function getPromptStringFromWorkspaceFolder(
  evaluate_promptString: string,
  update_promptString: string,
  cliche_promptString: string,
  chart_promptString: string
) {
  const promptFolder = path.join(
    vscode.workspace.workspaceFolders![0].uri.fsPath,
    'Prompt'
  );
  if (fs.existsSync(promptFolder)) {
    const promptFiles = fs.readdirSync(promptFolder);
    promptFiles.forEach((file) => {
      if (file.endsWith('.md')) {
        const filePath = path.join(promptFolder, file);
        const prompt = fs.readFileSync(filePath, 'utf8');

        evaluate_promptString = prompt;
        if (file.startsWith('update')) {
          update_promptString = prompt;
        }
        if (file.startsWith('cliche')) {
          cliche_promptString = prompt;
        }
        if (file.startsWith('chart')) {
          chart_promptString = prompt;
        }
        if (file.startsWith('evaluate')) {
          evaluate_promptString = prompt;
        }
      }
    });
  }
  return {
    evaluate_promptString,
    update_promptString,
    cliche_promptString,
    chart_promptString,
  };
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

class ChapterDecorationProvider implements vscode.FileDecorationProvider {
  private readonly _onDidChangeFileDecorations: vscode.EventEmitter<
    vscode.Uri | vscode.Uri[]
  > = new vscode.EventEmitter<vscode.Uri | vscode.Uri[]>();
  readonly onDidChangeFileDecorations: vscode.Event<vscode.Uri | vscode.Uri[]> =
    this._onDidChangeFileDecorations.event;

  provideFileDecoration(
    uri: vscode.Uri
  ): vscode.ProviderResult<vscode.FileDecoration> {
    // if it is in Analysis folder, ignore it
    // if it is in the project root folder, ignore it
    if (uri.fsPath.endsWith('.md')) {
      const fileName = path.basename(uri.fsPath);
      const filePath = path.join(getAnalysisFolder() ?? '', fileName);
      if (fs.existsSync(filePath)) {
        return {
          badge: ' ✔️',
          tooltip: 'Evaluated ',
        };
      }
      return undefined;
    }
  }
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

function setupChartWebviewProvider(context: vscode.ExtensionContext) {
  const provider = new ChartWebViewProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'vscodeChapterEval_chartWebview',
      provider
    )
  );
  return provider;
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
        const prompt = update_promptString.replace('$PROMPT$', selection);
        const longRunTask = callAI(openai, model, prompt, temperature).then(
          (data) => {
            const evalContent = JSON.parse(data);
            const result = `
\n\n### Model: ${evalContent.model}
\n\n### Prompt Token Size: ${evalContent.usage['prompt_tokens']} 
\n\n### Completion Token Size: ${evalContent.usage['completion_tokens']}  
\n\n### Total Token Size: ${evalContent.usage['total_tokens']}
\n\n### Original Selected:\n\n
----------\n\n
${selection}\n\n
----------\n\n
\n\n### Suggestion:\n\n
----------\n
${evalContent.choices[0]['message']['content']}           
            
`;
            updateProvider.updateContent(result);
            // then save it to the end of eval file
            const filename = getFileName(editor.document);
            const storagePath = getAnalysisFolder();
            if (!storagePath) {
              return;
            }

            const resultFilePath = path.join(storagePath, filename);
            if (fs.existsSync(resultFilePath)) {
              fs.appendFileSync(resultFilePath, result);
            }
          }
        );
        showStatusBarProgress(longRunTask);
      }
    })
  );
}

function registerCommandOfGenerateChart(
  context: vscode.ExtensionContext,
  chartProvider: ChartWebViewProvider,
  openai: OpenAI,
  model: string,
  chart_promptString: string,
  temperature: number
) {
  context.subscriptions.push(
    vscode.commands.registerCommand('vscodeChapterEval.generateChart', () => {
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
      // call openai generate chart data
      const text = editor.document.getText();
      const prompt = chart_promptString.replace('$PROMPT$', text);
      const longRunTask = callAI(openai, model, prompt, temperature).then(
        (data) => {
          const evalContent = JSON.parse(data);
          //evalContent need to be handled here

          const content = extractJsonFromString(
            evalContent.choices[0]['message']['content']
          );
          console.log(content);
          const event = content.curve.map((item: { event: any }) => item.event); // X轴: 事件描述
          const tensionValues = content.curve.map(
            (item: { tension: any }) => item.tension
          ); // Y轴: 张力
          const emotionValues = content.curve.map(
            (item: { emotion: any }) => item.emotion
          ); // Y轴: 情绪
          console.log(event, tensionValues, emotionValues);
          chartProvider.updateContent(event, tensionValues, emotionValues);
        }
      );
      showStatusBarProgress(longRunTask);
    })
  );
}

// function extractJsonFromString(input: string): any {
//   // Regular expression to match a JSON block
//   const jsonRegex = /{(?:[^{}]|"(?:\\.|[^"\\])*")*}/s;

//   // Find the JSON block
//   const match = input.match(jsonRegex);
//   if (!match) {
//       throw new Error("No JSON block found in the provided input.");
//   }

//   const jsonString = match[0].trim();
//   try {
//       return JSON.parse(jsonString);
//   } catch (error) {
//       throw new Error("Invalid JSON format: " + error);
//   }
// }

function extractJsonFromString(input: string): any {
  let depth = 0;
  let startIndex = -1;
  let endIndex = -1;

  for (let i = 0; i < input.length; i++) {
    if (input[i] === '{') {
      if (depth === 0) startIndex = i;
      depth++;
    } else if (input[i] === '}') {
      depth--;
      if (depth === 0) {
        endIndex = i + 1;
        break;
      }
    }
  }

  if (startIndex === -1 || endIndex === -1) {
    throw new Error('No valid JSON object found in the provided input.');
  }

  const jsonString = input.slice(startIndex, endIndex).trim();
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error('Invalid JSON format: ' + error);
  }
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
        statusBarItem.text = '✔️ ' + text_length.toString();
        statusBarItem.tooltip =
          l10n.t('evaluated') + '\n' + statusBarItem.tooltip;
        vscode.commands.executeCommand('vscodeChapterEval.showEvaluation');
      } else {
        statusBarItem.tooltip =
          l10n.t('notEvaluated') + '\n' + statusBarItem.tooltip;
        statusBarItem.text = '⏳ ' + text_length.toString();
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
          `Total Chinese words: ${stats.totalCount} Chapters: ${stats.fileCount}`
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
