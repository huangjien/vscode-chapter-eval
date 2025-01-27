import * as l10n from "@vscode/l10n";
import * as vscode from "vscode";
import { readTextAloud } from "../Functions";
import { showMessage, isMarkdownOrPlainText } from "../Utils";

export function registerCommandOfReadOutLoud(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("vscodeChapterEval.readOutLoud", () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        showMessage(
          l10n.t("noOpenMarkdownFile"), // No open Markdown file.
          "info"
        );
        return;
      }
      if (!isMarkdownOrPlainText(editor)) {
        showMessage(
          l10n.t("notMarkdown"), // This is not a Markdown or Plaintext file.
          "info"
        );
        return;
      }
      const text = editor.document.getText(editor.selection);
      if (text) {
        readTextAloud(text);
      } else {
        showMessage(l10n.t("noTextSelect"), "info"); // No text selected
      }
    })
  );
}
