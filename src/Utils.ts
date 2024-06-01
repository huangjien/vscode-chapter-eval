'use strict';
import * as CryptoJS from "crypto";
import * as fs from "fs";
import OpenAI from "openai";
import * as path from "path";
import * as vscode from "vscode";

export function printToOutput(result: string) {
  // Create an output channel (if it doesn't exist already) and get a reference to it
  const outputChannel = vscode.window.createOutputChannel('Chapter Evaluation');

  // Clear any previous content in the output channel
  outputChannel.clear();

  // Write the result to the output channel
  outputChannel.appendLine(result);

  // Bring the Output window into focus with our output channel visible
  outputChannel.show(true); // Pass `true` to preserve focus on the editor
}

export function writeToLocal(fileName: string, fileContent: string): string {
  // if file already existed, get its content, append to the end of fileContent
  //   var writeContent = fileContent;
  //   if (fs.existsSync(fileName)) {
  //     writeContent = fileContent + "\n\n---\n\n" +fs.readFileSync(fileName).toString();
  //   }
  fs.writeFileSync(fileName, fileContent, 'utf8');
  vscode.window.showInformationMessage(
    `Evaluation result saved to ${fileName}`
  );
  return fileName;
}

export function digest(message: string) {
  return CryptoJS.createHash('sha1')
    .update(message.replace(/\s/g, '').replace('　', ''), 'utf8')
    .digest('hex')
    .substring(0, 8);
}

export function formatMarkdown(text: string): string {
  // Split the text into paragraphs
  const paragraphs = text.trim().split(/\n\s*\n/);

  // Process each paragraph
  const processedParagraphs = paragraphs.map((paragraph) => {
    // Trim whitespace
    paragraph = paragraph.trim();

    // Ensure spacing between English and Chinese characters
    // Regex explains: English to Chinese
    paragraph = paragraph.replace(/([a-zA-Z])([\u4e00-\u9fa5])/g, '$1 $2');
    // Chinese to English
    paragraph = paragraph.replace(/([\u4e00-\u9fa5])([a-zA-Z])/g, '$1 $2');

    // Add 2 spaces indentation
    paragraph = paragraph
      .split('\n')
      .map((line) => line)
      .join('\n');

    return '　　' + paragraph;
  });

  // Reassemble the paragraphs, ensuring an empty line between each
  return '　　\n\n' + processedParagraphs.join('\n\n');
}

export function showStatusBarProgress(task: Promise<any>) {
  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Processing...',
      cancellable: true, // Set to true if you want to allow cancelling the task
    },
    () => {
      return task; // The progress UI will show until this Promise resolves
    }
  );
}

export function displayMarkdownFromFile(filePath: string) {
  const uri = vscode.Uri.file(filePath);
  vscode.commands.executeCommand('markdown.showPreview', uri);
}
export async function evaluateChapter(
  openai: OpenAI,
  editor: vscode.TextEditor,
  storagePath: string,
  promptString: string,
  model: string,
  temperature: number,
  maxToken: number
) {
  // get file base info, and chars number
  if (editor.document.isDirty) {
    vscode.window.showWarningMessage(
      'Please save your file before evaluation, or you may just waste your money!'
    );
    return;
  }
  const source_file_uri = editor.document.uri;
  const source_file_stat = fs.lstatSync(source_file_uri.fsPath);
  const filename = (editor.document.fileName
    .split('\\')
    .pop()
    ?.split('/')
    .pop())!;

  const documentText = editor.document.getText();
  const text_length = documentText.length;
  // Proceed to evaluate the documentText with OpenAI and handle the result
  // calculate its hash, if we have done that before, it will be save in your local disk, just read from there
  const stringHash = digest(documentText);
  const resultFilePath = path.join(storagePath, filename);
  promptString = promptString.replace('$PROMPT$', documentText);
  // if file already existed, check its first 8 chars,
  // if matched, then we have done the evaluation, just display it.
  // if not matched, need to do evaluation again.
  var exist_content = '';
  if (fs.existsSync(resultFilePath)) {
    var content = fs.readFileSync(resultFilePath).toString();
    if (content.startsWith(stringHash)) {
      displayMarkdownFromFile(resultFilePath);
      return;
    }
    exist_content = '\n\n---\n\n' + content;
  }

  // does not exist, call openAi to make it.
  await openai.chat.completions
    .create({
      model: model,
      messages: [{ role: 'user', content: promptString }],
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
        stringHash +
        '\n\nLength: ' +
        text_length +
        '\n\nLast Modified: ' +
        source_file_stat.mtime.toISOString() +
        '\n\n<details><summary>' +
        source_file_stat.mtime.toISOString() +
        '</summary><br/>' +
        evalContent.choices[0]['message']['content'] +
        '</details>' +
        exist_content
      );
    })
    .catch((err) => {
      vscode.window.showErrorMessage(err.message);
    });

  if (fs.existsSync(resultFilePath)) {
    displayMarkdownFromFile(resultFilePath);
  }
  return promptString;
}

