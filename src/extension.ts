"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as CryptoJS from "crypto";
import OpenAI from "openai";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const storagePath = context.globalStoragePath;
  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
  }
  const apiKey: string = vscode.workspace
    .getConfiguration("vscodeChapterEval")
    .get("openaiApiKey")!;
  if (!apiKey) {
    vscode.window.showErrorMessage("OpenAI API key is not set in settings.");
    return;
  }
  process.env.OPENAI_API_KEY = apiKey;
  var model: string = vscode.workspace
    .getConfiguration("vscodeChapterEval")
    .get("model")!;
  if (!model) {
    model = "GPT-4";
  }

  var temperature: number = vscode.workspace
    .getConfiguration("vscodeChapterEval")
    .get("temperature")!;
  if (!temperature) {
    temperature = 1;
  }

  var maxToken: number = vscode.workspace
    .getConfiguration("vscodeChapterEval")
    .get("maxToken")!;
  if (!maxToken) {
    maxToken = 4096;
  }

  vscode.languages.registerHoverProvider('markdown',{
    provideHover(document, position, token) {
        // only when hover at the beginning of the chapter, will show tooltip
        if (position.line > 0 && position.character >0) {
            return;
        }
        var tip = "No Evaluation Now.";
        const content = document.getText();
        const stringHash = digest(content);
        const resultFilePath = path.join(storagePath, stringHash + ".md");
        if (fs.existsSync(resultFilePath)) {
            tip = fs.readFileSync(resultFilePath).toString();
        }
        return new vscode.Hover(tip)
    }
  });

  let evaluator = vscode.commands.registerCommand(
    "vscodeChapterEval.evaluateMarkdown",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage("No open Markdown file.");
        return;
      }
      if (
        editor.document.languageId != "markdown" &&
        editor.document.languageId != "plaintext"
      ) {
        vscode.window.showInformationMessage(
          "This is not a Markdown or Plaintext file."
        );
        return;
      }

      let promptString: string = vscode.workspace
        .getConfiguration("vscodeChapterEval")
        .get("prompt")!;
      if (!promptString) {
        vscode.window.showWarningMessage("OpenAI prompt is not set!");
        promptString = `You are ASSISTANT , work as literary critic. Please evaluate the tension of the following chapter and give it a score out of 100. 
            Also, describe the curve of the tension changes in the chapter. 
            Point out the three most outstanding advantages and the three biggest disadvantages of the chapter. 
            If you find any typographical errors, please point them out. 
            \n\nUSER: $PROMPT$ \n\nASSISTANT: `;
      }

      const longRunTask = evaluateChapter(
        editor,
        storagePath,
        promptString,
        apiKey,
        model,
        temperature,
        maxToken
      );
      showStatusBarProgress(longRunTask);
    }
  );
  context.subscriptions.push(evaluator);
  context.subscriptions.push(
    vscode.commands.registerCommand("vscodeChapterEval.formatMarkdown", () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage("No open Markdown file.");
        return;
      }
      if (
        editor.document.languageId != "markdown" &&
        editor.document.languageId != "plaintext"
      ) {
        vscode.window.showInformationMessage(
          "This is not a Markdown or Plaintext file."
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

function formatMarkdown(text: string): string {
  // Split the text into paragraphs
  const paragraphs = text.trim().split(/\n\s*\n/);

  // Process each paragraph
  const processedParagraphs = paragraphs.map((paragraph) => {
    // Trim whitespace
    paragraph = paragraph.trim();

    // Ensure spacing between English and Chinese characters
    // Regex explains: English to Chinese
    paragraph = paragraph.replace(/([a-zA-Z])([\u4e00-\u9fa5])/g, "$1 $2");
    // Chinese to English
    paragraph = paragraph.replace(/([\u4e00-\u9fa5])([a-zA-Z])/g, "$1 $2");

    // Add 2 spaces indentation
    paragraph = paragraph
      .split("\n")
      .map((line) => line)
      .join("\n");

    return "　　" + paragraph;
  });

  // Reassemble the paragraphs, ensuring an empty line between each
  return "　　\n\n" + processedParagraphs.join("\n\n");
}

function showStatusBarProgress(task: Promise<any>) {
  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Processing...",
      cancellable: true, // Set to true if you want to allow cancelling the task
    },
    () => {
      return task; // The progress UI will show until this Promise resolves
    }
  );
}

async function evaluateChapter(
  editor: vscode.TextEditor,
  storagePath: string,
  promptString: string,
  apiKey: string,
  model: string,
  temperature: number,
  maxToken: number
) {
  const documentText = editor.document.getText();
  // Proceed to evaluate the documentText with OpenAI and handle the result
  // calculate its hash, if we have done that before, it will be save in your local disk, just read from there
  const stringHash = digest(documentText);
  const resultFilePath = path.join(storagePath, stringHash + ".md");
  promptString = promptString.replace("$PROMPT$", documentText);
  if (!fs.existsSync(resultFilePath)) {
    // does not exist, call openAi to make it.
    const openai = new OpenAI();

    await openai.chat.completions
      .create({
        model: model,
        messages: [{ role: "system", content: promptString }],
        temperature: temperature,
        max_tokens: maxToken,
      })
      .then((data) => {
        return JSON.stringify(data);
      })
      .then((data) => {
        const evalContent = JSON.parse(data);
        writeToLocal(
          resultFilePath,
          evalContent.choices[0]["message"]["content"]
        );
      })
      .catch((err) => {
        vscode.window.showErrorMessage(err.message);
      });
  }

  if (fs.existsSync(resultFilePath)) {
    displayMarkdownFromFile(resultFilePath);
  }
  return promptString;
}

// this method is called when your extension is deactivated
export function deactivate() {}

export function displayMarkdownFromFile(filePath: string) {
  const uri = vscode.Uri.file(filePath);
  vscode.commands.executeCommand("markdown.showPreview", uri);
}

export function printToOutput(result: string) {
  // Create an output channel (if it doesn't exist already) and get a reference to it
  const outputChannel = vscode.window.createOutputChannel("Chapter Evaluation");

  // Clear any previous content in the output channel
  outputChannel.clear();

  // Write the result to the output channel
  outputChannel.appendLine(result);

  // Bring the Output window into focus with our output channel visible
  outputChannel.show(true); // Pass `true` to preserve focus on the editor
}

export function digest(message: string) {
  return CryptoJS.createHash("sha1")
    .update(message.replace(/\s/g, "").replace("　", ""), "utf8")
    .digest("hex")
    .substring(0, 8);
}

export function writeToLocal(fileName: string, fileContent: string): string {
  fs.writeFileSync(fileName, fileContent, "utf8");
  vscode.window.showInformationMessage(
    `Evaluation result saved to ${fileName}`
  );
  return fileName;
}
