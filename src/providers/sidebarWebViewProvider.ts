import * as vscode from 'vscode';
import { EvaluationWebViewProvider } from './evaluationWebViewProvider';

export function setupSidebarWebviewProvider(context: vscode.ExtensionContext) {
  const provider = new EvaluationWebViewProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'vscodeChapterEval_markdownWebview',
      provider
    )
  );
  vscode.commands.executeCommand('vscodeChapterEval.showEvaluation');
  return provider;
}
