import * as l10n from '@vscode/l10n';
import * as vscode from 'vscode';
import { sortAndRenameFiles } from '../Functions';
import { showMessage } from '../Utils';

export function registerCommandOfSortAndRename(
  context: vscode.ExtensionContext
) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'vscodeChapterEval.sortAndRenameFiles',
      async (...commandArgs) => {
        if (commandArgs.length <= 0) {
          showMessage(l10n.t('noFolderSelected'), 'info');
          return;
        }
        const currentFolder = commandArgs[0].fsPath;
        sortAndRenameFiles(currentFolder);

        return;
      }
    )
  );
}
