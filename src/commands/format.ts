import * as l10n from '@vscode/l10n';
import * as vscode from 'vscode';
import { formatMarkdown } from '../Functions';
import { showMessage, isMarkdownOrPlainText } from '../Utils';

export function registerCommandOfFormat(context: vscode.ExtensionContext) {
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
