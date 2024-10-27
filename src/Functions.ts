import { exec } from 'child_process';
import {
  digest,
  displayMarkdownFromFile,
  getAnalysisFolder,
  getFileName,
  showMessage,
  writeToLocal,
} from './Utils';
import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';
import * as vscode from 'vscode';
import * as l10n from '@vscode/l10n';
import { marked } from 'marked';
import puppeteer from 'puppeteer';

export async function mergeMarkdownAndGeneratePDF(
  sourceDir: string,
  outputPDFPath: string
): Promise<void> {
  try {
    // Read all .md files in the directory
    const files = fs
      .readdirSync(sourceDir)
      .filter((file) => file.endsWith('.md'))
      .sort((a, b) => {
        const aNum = parseFloat(a.split('_')[0]);
        const bNum = parseFloat(b.split('_')[0]);
        return aNum - bNum;
      });

    // Merge content of all .md files
    let mergedContent = '';
    for (const file of files) {
      const filePath = path.join(sourceDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      mergedContent += `\n\n# ${path.basename(file, '.md').replace('_', '  ')}\n\n${content}`;
    }
    // Convert Markdown to HTML
    const htmlContent = await marked.parse(mergedContent);

    // Launch Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set content and wait for network idle
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Generate PDF
    await page.pdf({
      path: outputPDFPath,
      format: 'A4',
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
      printBackground: true,
    });

    // Close the browser
    await browser.close();

    vscode.window.showInformationMessage(
      `PDF generated successfully: ${outputPDFPath}`
    );
  } catch (error) {
    vscode.window.showErrorMessage(`Error generating PDF: ${error}`);
  }
}
export interface FileStats {
  filename: string;
  characterCount: number;
  lastModified: Date;
}

export interface DirectoryStats {
  totalCount: number;
  fileCount: number;
  files: FileStats[];
}

export function countChineseCharactersInFile(filepath: string): number {
  try {
    const content = fs.readFileSync(filepath, 'utf-8');
    return (content.match(/[\u4e00-\u9fff]/g) || []).length;
  } catch (error) {
    console.error(`Error reading file ${filepath}: ${error}`);
    return 0;
  }
}

export function countChineseCharactersInDirectory(
  directory: string
): DirectoryStats {
  let totalCount = 0;
  let fileCount = 0;
  const files: FileStats[] = [];

  try {
    const allFiles = fs
      .readdirSync(directory)
      .filter((file) => file.endsWith('.md'))
      .sort((a, b) => {
        const aParts = a
          .split('_')[0]
          .split('.')
          .map((part) => (isNaN(Number(part)) ? part : Number(part)));
        const bParts = b
          .split('_')[0]
          .split('.')
          .map((part) => (isNaN(Number(part)) ? part : Number(part)));
        for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
          if (aParts[i] < bParts[i]) return -1;
          if (aParts[i] > bParts[i]) return 1;
        }
        return aParts.length - bParts.length;
      });

    for (const file of allFiles) {
      const filepath = path.join(directory, file);
      const characterCount = countChineseCharactersInFile(filepath);
      const lastModified = fs.statSync(filepath).mtime;
      const filename = path.basename(filepath, '.md');

      files.push({ filename, characterCount, lastModified });
      totalCount += characterCount;
      fileCount++;
    }
  } catch (error) {
    console.error(`Error processing directory ${directory}: ${error}`);
  }

  return { totalCount, fileCount, files };
}

export function generateCSVReport(
  stats: DirectoryStats,
  outputPath: string
): void {
  const header = 'Chapter,Character Count,Last Modified\n';
  const rows = stats.files
    .map(
      (file) =>
        `${file.filename},${file.characterCount},${file.lastModified.toISOString().replace('T', ' ').substring(0, 19)}`
    )
    .join('\n');

  fs.writeFileSync(outputPath, header + rows);
}

export function appendToLog(stats: DirectoryStats, logPath: string): void {
  const currentDate = new Date()
    .toISOString()
    .replace('T', ' ')
    .substring(0, 19);
  const logEntry = `\n${currentDate},${stats.fileCount},${stats.totalCount}`;

  fs.appendFileSync(logPath, logEntry);
}

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

export function sortAndRenameFiles(folderPath: string) {
  // Read all files in the directory
  const files = fs.readdirSync(folderPath);

  // Filter for markdown files and parse their names
  const mdFiles = files
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const match = file.match(/^(\d+(?:\.\d+)?)_(.+)\.md$/);
      if (match) {
        return {
          originalName: file,
          number: parseFloat(match[1]),
          baseName: match[2],
        };
      }
      return null;
    })
    .filter((file): file is NonNullable<typeof file> => file !== null);

  // Sort the files based on their number
  mdFiles.sort((a, b) => a.number - b.number);

  // Rename files
  let newNumber = 1;
  mdFiles.forEach((file) => {
    const newName = `${newNumber}_${file.baseName}.md`;
    const oldPath = path.join(folderPath, file.originalName);
    const newPath = path.join(folderPath, newName);

    fs.renameSync(oldPath, newPath);
    // console.log(`Renamed ${file.originalName} to ${newName}`);
    // if in Analysis folder, rename the corresponding file in the Analysis folder
    const analysisFolder = getAnalysisFolder();
    if (analysisFolder) {
      const analysisFilePath = path.join(analysisFolder, file.originalName);
      const newAnalysisFilePath = path.join(analysisFolder, newName);
      if (fs.existsSync(analysisFilePath)) {
        fs.renameSync(analysisFilePath, newAnalysisFilePath);
        // console.log(`Renamed ${file.originalName} in Analysis folder to ${newName}`);
      }
    }

    newNumber++;
  });

  vscode.window.showInformationMessage(
    `Sorted and renamed ${mdFiles.length} markdown files in ${folderPath}`
  );
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
