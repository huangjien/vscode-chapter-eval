import * as l10n from "@vscode/l10n";
import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import {
  getAnalysisFolder,
  showMessage,
  printToOutput,
  isMarkdownOrPlainText,
  countChineseString,
  getFileName,
} from "../Utils";

export function setupStatusBarItem(context: vscode.ExtensionContext) {
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    400
  );
  statusBarItem.command = "vscodeChapterEval.toggleStatusBar";
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
      "vscodeChapterEval.toggleStatusBar",
      async () => {
        const selectedOption = await vscode.window.showQuickPick(
          [
            l10n.t("evaluateCurrent"), //Evaluate Current Chapter
            l10n.t("formatCurrent"), //Format Current Chapter
            l10n.t("infoCurrent"), // Information of Current Chapter
          ],
          { placeHolder: "You can choose" }
        );
        if (selectedOption === l10n.t("evaluateCurrent")) {
          if (statusBarItem.text.startsWith(l10n.t("evaluated"))) {
            showMessage(
              l10n.t("displayEvaluation"), // Display existing evaluation...
              "info"
            );
            vscode.commands.executeCommand("vscodeChapterEval.showEvaluation");
          } else {
            showMessage(
              l10n.t("evaluateDocument"), // Evaluating current document...
              "info"
            );
            vscode.commands.executeCommand(
              "vscodeChapterEval.evaluateMarkdown"
            );
          }
        }
        if (selectedOption === l10n.t("formatCurrent")) {
          vscode.commands.executeCommand("vscodeChapterEval.formatMarkdown");
        }
        if (selectedOption === l10n.t("infoCurrent")) {
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
        "🇨🇳 " +
        text_length.toString() +
        " 🔠" +
        non.toString() +
        "📃 " +
        invisible.toString() +
        "\n🕗 " +
        source_file_stat.mtime.toISOString().replace("T", " ").replace("Z", "");
      const filename = getFileName(editor.document);

      const resultFilePath = path.join(storagePath, filename);
      if (fs.existsSync(resultFilePath)) {
        statusBarItem.text = "✔️ " + text_length.toString();
        statusBarItem.tooltip =
          l10n.t("evaluated") + "\n" + statusBarItem.tooltip;
        vscode.commands.executeCommand("vscodeChapterEval.showEvaluation");
      } else {
        statusBarItem.tooltip =
          l10n.t("notEvaluated") + "\n" + statusBarItem.tooltip;
        statusBarItem.text = "⏳ " + text_length.toString();
      }
      statusBarItem.show();
    } else {
      statusBarItem.hide();
    }
  };
}
