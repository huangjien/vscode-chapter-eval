import * as vscode from "vscode";
import { registerCommandOfReadOutLoud } from "./readOutLoud";
import { registerCommandOfEvaluation } from "./evaluation";
import { registerCommandOfUpdateCandidate } from "./updateCandidate";
import { registerCommandOfGenerateChart } from "./generateChart";
import { registerCommandOfShowEvaluation } from "./showEvaluation";
import { registerCommandOfSummaryOfToday } from "./summaryOfToday";
import { registerCommandOfGeneratePDF } from "./generatePDF";
import { registerCommandOfShowExistedEvaluation } from "./showExistedEvaluation";
import { registerCommandOfFormat } from "./format";
import { registerCommandOfSortAndRename } from "./sortAndRename";
import OpenAI from "openai";
import { setupCandidateWebviewProvider } from "../providers/candidateWebViewProvider";
import { setupChartWebviewProvider } from "../providers/chartWebViewProvider";
import { ChapterDecorationProvider } from "../providers/chapterDecorationProvider";
import { setupSettingWebviewProvider } from "../providers/settingsWebViewProvider";
import { setupSidebarWebviewProvider } from "../providers/sidebarWebViewProvider";
import { setupStatusBarItem } from "../statusBar/statusBar";
import { getConfiguration, showMessage } from "../Utils";
import { l10n } from "vscode";
import { getPromptStringFromWorkspaceFolder, setupL10N } from "../Functions";

export function register2VSCode(context: vscode.ExtensionContext) {
  setupL10N(context);

  const provider = new ChapterDecorationProvider();
  context.subscriptions.push(
    vscode.window.registerFileDecorationProvider(provider)
  );
  registerCommandOfReadOutLoud(context);
  registerCommandOfEvaluation(
    context,
    openai,
    evaluate_promptString,
    model,
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
  const chartProvider = setupChartWebviewProvider(context);
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
