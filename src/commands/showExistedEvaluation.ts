import OpenAI from 'openai';
import * as vscode from 'vscode';
import { setupStatusBarItem } from '../statusBar/statusBar';
import { getPromptStringFromWorkspaceFolder } from '../Functions';
import { ChapterDecorationProvider } from '../providers/chapterDecorationProvider';
import { registerHoverProvider } from '../providers/hoverProvider';
import { setupL10N } from '../Functions';
import { setupSidebarWebviewProvider } from '../providers/sidebarWebViewProvider';
import { setupCandidateWebviewProvider } from '../providers/candidateWebViewProvider';
import { setupChartWebviewProvider } from '../providers/chartWebViewProvider';
import { setupSettingWebviewProvider } from '../providers/settingsWebViewProvider';
import { registerCommandOfEvaluation } from './evaluation';
import { registerCommandOfReadOutLoud } from './readOutLoud';
import { registerCommandOfSortAndRename } from './sortAndRename';
import { registerCommandOfFormat } from './format';
import { registerCommandOfGeneratePDF } from './generatePDF';
import { registerCommandOfSummaryOfToday } from './summaryOfToday';
import { registerCommandOfShowEvaluation } from './showEvaluation';
import { registerCommandOfGenerateChart } from './generateChart';
import { registerCommandOfUpdateCandidate } from './updateCandidate';
import {
  getAnalysisFolder,
  getConfiguration,
  getFileName,
  isMarkdownOrPlainText,
  showMessage,
} from '../Utils';
import * as l10n from '@vscode/l10n';
import * as fs from 'fs';
import * as path from 'path';

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
    showMessage(l10n.t('promptNotSet', 'OpenAI prompt is not set!'), 'warning');
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
export function registerCommandOfShowExistedEvaluation(
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
