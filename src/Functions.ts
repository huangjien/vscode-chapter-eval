import { exec } from 'child_process';
import {
  digest,
  displayMarkdownFromFile,
  getFileName,
  showMessage,
  writeToLocal,
} from './Utils';
import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';
import * as vscode from 'vscode';
import * as l10n from '@vscode/l10n';

export async function evaluateChapter(
  openai: OpenAI,
  editor: vscode.TextEditor,
  storagePath: string,
  promptString: string,
  model: string,
  temperature: number
) {
  // get file base info, and chars number
  if (editor.document.isDirty) {
    showMessage(
      l10n.t(
        'donotWaste' // 'Please save your file before evaluation, or you may just waste your money!'
      ),
      'warning'
    );
    return;
  }
  const source_file_uri = editor.document.uri;
  const source_file_stat = fs.lstatSync(source_file_uri.fsPath);
  const filename = getFileName(editor.document);

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
  let exist_content = '';
  if (fs.existsSync(resultFilePath)) {
    const content = fs.readFileSync(resultFilePath).toString();
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
    })
    .then((data) => {
      return JSON.stringify(data);
    })
    .then((data) => {
      const evalContent = JSON.parse(data);
      writeToLocal(
        resultFilePath,
        stringHash +
          '\n\n### ' +
          filename +
          '\n\n### Size: ' +
          text_length +
          '\n\n#### Model: ' +
          model +
          '\n\n#### Temperature: ' +
          temperature +
          '\n\n' +
          source_file_stat.mtime
            .toISOString()
            .replace('T', ' ')
            .replace('Z', '') +
          '\n\n' +
          evalContent.choices[0]['message']['content'] +
          '\n\n' +
          exist_content
      );
    })
    .catch((err) => {
      showMessage(err.message, 'error');
    });

  if (fs.existsSync(resultFilePath)) {
    displayMarkdownFromFile(resultFilePath);
  }
  return promptString;
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

export function readTextAloud(text: string) {
  const platform = process.platform;

  let command = '';
  switch (platform) {
    case 'win32':
      // Windows
      command =
        `powershell -Command "Add-Type -AssemblyName System.speech;` +
        `[System.Speech.Synthesis.SpeechSynthesizer]::new().Speak('${text.replace(/'/g, "''")}');"`;
      break;
    case 'darwin':
      // macOS
      command = `say "${text}"`;
      break;
    case 'linux':
      // Linux
      command = `espeak "${text}"`;
      break;
    default:
      showMessage(l10n.t('unsupport'), 'error'); // Unsupported platform
      return;
  }

  exec(command, (error, stdout, stderr) => {
    if (error) {
      showMessage(`Error: ${error.message}`, 'error');
      return;
    }
    if (stderr) {
      showMessage(`stderr: ${stderr}`, 'error');
      return;
    }
    showMessage(l10n.t('readOut'), 'info'); // Text read out loud successfully
  });
}
