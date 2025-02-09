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
import { getConfiguration } from "../Utils";
import { setupL10N } from "../Functions";
import { PromptsManager } from "../Prompts";

export function register2VSCode(context: vscode.ExtensionContext) {
  setupL10N(context);

  const openai = new OpenAI(getConfiguration("openaiKey", ""));

  const provider = new ChapterDecorationProvider();
  context.subscriptions.push(
    vscode.window.registerFileDecorationProvider(provider)
  );
  registerCommandOfReadOutLoud(context);
  registerCommandOfEvaluation(
    context,
    openai,
    PromptsManager.getInstance().getPromptByName("evaluate")!["prompt"],
    PromptsManager.getInstance().getPromptByName("evaluate")!["modelName"],
    PromptsManager.getInstance().getPromptByName("evaluate")!["temperature"]
  );
  setupSettingWebviewProvider(context);
  const updateProvider = setupCandidateWebviewProvider(context);
  registerCommandOfUpdateCandidate(
    context,
    updateProvider,
    openai,
    PromptsManager.getInstance().getPromptByName("update")!["modelName"],
    PromptsManager.getInstance().getPromptByName("update")!["prompt"],
    PromptsManager.getInstance().getPromptByName("update")!["temperature"]
  );
  const chartProvider = setupChartWebviewProvider(context);
  registerCommandOfGenerateChart(
    context,
    chartProvider,
    openai,
    PromptsManager.getInstance().getPromptByName("chart")!["modelName"],
    PromptsManager.getInstance().getPromptByName("chart")!["prompt"],
    PromptsManager.getInstance().getPromptByName("chart")!["temperature"]
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
