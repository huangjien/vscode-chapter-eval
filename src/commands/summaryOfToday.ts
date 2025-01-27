import * as l10n from "@vscode/l10n";
import * as path from "path";
import * as vscode from "vscode";
import {
  countChineseCharactersInDirectory,
  generateCSVReport,
  appendToLog,
} from "../Functions";
import { showMessage } from "../Utils";

export function registerCommandOfSummaryOfToday(
  context: vscode.ExtensionContext
) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscodeChapterEval.summaryOfToday",
      async (...commandArgs) => {
        if (commandArgs.length <= 0) {
          showMessage(l10n.t("noFolderSelected"), "info");
          return;
        }
        const currentFolder = commandArgs[0].fsPath;
        const stats = countChineseCharactersInDirectory(currentFolder);
        vscode.window.showInformationMessage(
          `Total Chinese words: ${stats.totalCount} Chapters: ${stats.fileCount}`
        );

        // Generate CSV report
        generateCSVReport(stats, path.join(currentFolder, "report.csv"));

        // Append to log
        appendToLog(stats, path.join(currentFolder, "log.csv"));

        return;
      }
    )
  );
}
