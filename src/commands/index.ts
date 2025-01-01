import * as vscode from 'vscode';
import { registerCommandOfReadOutLoud } from './readOutLoud';
import { registerCommandOfEvaluation } from './evaluation';
import { registerCommandOfUpdateCandidate } from './updateCandidate';
import { registerCommandOfGenerateChart } from './generateChart';
import { registerCommandOfShowEvaluation } from './showEvaluation';
import { registerCommandOfSummaryOfToday } from './summaryOfToday';
import { registerCommandOfGeneratePDF } from './generatePDF';
import { registerCommandOfShowExistedEvaluation } from './showExistedEvaluation';
import { registerCommandOfFormat } from './format';
import { registerCommandOfSortAndRename } from './sortAndRename';
import OpenAI from 'openai';
import { setupCandidateWebviewProvider } from '../providers/candidateWebViewProvider';
import { setupChartWebviewProvider } from '../providers/chartWebViewProvider';
import { ChapterDecorationProvider } from '../providers/chapterDecorationProvider';
import { setupSettingWebviewProvider } from '../providers/settingsWebViewProvider';
import { setupSidebarWebviewProvider } from '../providers/sidebarWebViewProvider';
import { setupStatusBarItem } from '../statusBar/statusBar';

export function register2VSCode(context: vscode.ExtensionContext) {
  const provider = new ChapterDecorationProvider();
  context.subscriptions.push(
    vscode.window.registerFileDecorationProvider(provider)
  );
  registerCommandOfReadOutLoud(context);
  const openai = new OpenAI(); // Initialize OpenAI instance
  const promptString = 'Your prompt string here';
  const model = 'Your model here';
  const temperature = 0.7; // Example temperature value
  registerCommandOfEvaluation(
    context,
    openai,
    promptString,
    model,
    temperature
  );
  setupSettingWebviewProvider(context);
  const updateProvider = setupCandidateWebviewProvider(context);
  const update_promptString = 'Your update prompt string here';
  registerCommandOfUpdateCandidate(
    context,
    updateProvider,
    openai,
    model,
    update_promptString,
    temperature
  );
  const chartProvider = setupChartWebviewProvider(context);
  const chart_promptString = 'Your chart prompt string here';
  registerCommandOfGenerateChart(
    context,
    chartProvider,
    openai,
    model,
    chart_promptString,
    temperature
  );
  const evaluationProvider = setupSidebarWebviewProvider(context);
  registerCommandOfShowEvaluation(context, evaluationProvider);
  registerCommandOfSummaryOfToday(context);
  registerCommandOfGeneratePDF(context);
  registerCommandOfShowExistedEvaluation(context);
  registerCommandOfFormat(context);
  registerCommandOfSortAndRename(context);
  setupStatusBarItem(context);
}
