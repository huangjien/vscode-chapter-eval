import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { getAnalysisFolder, getFileName } from '../Utils';
import { EvaluationWebViewProvider } from '../providers/evaluationWebViewProvider';

export function registerCommandOfShowEvaluation(
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
