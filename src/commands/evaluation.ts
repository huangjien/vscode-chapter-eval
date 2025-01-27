import * as l10n from "@vscode/l10n";
import OpenAI from "openai";
import * as vscode from "vscode";
import { evaluateChapter } from "../Functions";
import {
  showMessage,
  isMarkdownOrPlainText,
  getOrCreateAnalysisFolder,
  showStatusBarProgress,
} from "../Utils";

export function registerCommandOfEvaluation(
  context: vscode.ExtensionContext,
  openai: OpenAI,
  promptString: string,
  model: string,
  temperature: number
) {
  const evaluator = vscode.commands.registerCommand(
    "vscodeChapterEval.evaluateMarkdown",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        showMessage(
          l10n.t("noOpenMarkdownFile", "No open Markdown file."),
          "info"
        );
        return;
      }
      if (!isMarkdownOrPlainText(editor)) {
        showMessage(
          l10n.t("notMarkdown", "This is not a Markdown or Plaintext file."),
          "info"
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
