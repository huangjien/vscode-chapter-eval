import * as vscode from "vscode";
import {
  getAnalysisFolder,
  getFileName,
  isMarkdownOrPlainText,
  showMessage,
} from "../Utils";
import * as l10n from "@vscode/l10n";
import * as fs from "fs";
import * as path from "path";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

export function registerCommandOfShowExistedEvaluation(
  context: vscode.ExtensionContext
) {
  context.subscriptions.push(
    // ctrl+f1, show existed evaluation
    vscode.commands.registerCommand(
      "vscodeChapterEval.showExistedEvaluation",
      () => {
        return async () => {
          const editor = vscode.window.activeTextEditor;
          if (!editor) {
            showMessage(
              l10n.t("noOpenMarkdownFile"), // No open Markdown file.
              "info"
            );
            return;
          }
          if (!isMarkdownOrPlainText(editor)) {
            showMessage(l10n.t("notMarkdown"), "info");
            return;
          }
          let tip = l10n.t("noEvaluationNow");
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
