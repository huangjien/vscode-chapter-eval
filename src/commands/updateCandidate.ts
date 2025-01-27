import * as l10n from "@vscode/l10n";
import * as fs from "fs";
import OpenAI from "openai";
import * as path from "path";
import * as vscode from "vscode";
import { CandidateWebViewProvider } from "../providers/candidateWebViewProvider";
import { callAI } from "../Functions";
import {
  showMessage,
  isMarkdownOrPlainText,
  getFileName,
  getAnalysisFolder,
  showStatusBarProgress,
} from "../Utils";

export function registerCommandOfUpdateCandidate(
  context: vscode.ExtensionContext,
  updateProvider: CandidateWebViewProvider,
  openai: OpenAI,
  model: string,
  update_promptString: string,
  temperature: number
) {
  context.subscriptions.push(
    vscode.commands.registerCommand("vscodeChapterEval.updateSelected", () => {
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
          l10n.t("notMarkdownFile"), // Not a Markdown file.
          "info"
        );
        return;
      }
      const selection = editor.document.getText(editor.selection);
      if (!selection) {
        showMessage(
          l10n.t("noTextSelect"), // No selection.
          "info"
        );
        return;
      } else {
        // Get the current editor's selected text, context (up and down)
        // send to AI to get the 3 updated version
        // display them in the sidebar
        const prompt = update_promptString.replace("$PROMPT$", selection);
        const longRunTask = callAI(openai, model, prompt, temperature).then(
          (data) => {
            const evalContent = JSON.parse(data);
            const result = `
\n\n### Model: ${evalContent.model}
\n\n### Prompt Token Size: ${evalContent.usage["prompt_tokens"]} 
\n\n### Completion Token Size: ${evalContent.usage["completion_tokens"]}  
\n\n### Total Token Size: ${evalContent.usage["total_tokens"]}
\n\n### Original Selected:\n\n
----------\n\n
${selection}\n\n
----------\n\n
\n\n### Suggestion:\n\n
----------\n
${evalContent.choices[0]["message"]["content"]}           
            
`;
            updateProvider.updateContent(result);
            // then save it to the end of eval file
            const filename = getFileName(editor.document);
            const storagePath = getAnalysisFolder();
            if (!storagePath) {
              return;
            }

            const resultFilePath = path.join(storagePath, filename);
            if (fs.existsSync(resultFilePath)) {
              fs.appendFileSync(resultFilePath, result);
            }
          }
        );
        showStatusBarProgress(longRunTask);
      }
    })
  );
}
