import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as l10n from '@vscode/l10n';
import { marked } from 'marked';
import { showMessage } from './Utils';

interface JsonObject {
  id: string;
  timestamp: string;
  question: string;
  answer: string; //markdown format
  modelName: string;
  temperature: string;
}

export class RequestAndAnswerWebViewProvider
  implements vscode.WebviewViewProvider
{
  public static readonly viewType = 'markdownView';
  public _view?: vscode.WebviewView;
  constructor(private context: vscode.ExtensionContext) {}
  resolveWebviewView(webviewView: vscode.WebviewView): Thenable<void> | void {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
    };
    webviewView.webview.html = this.getWebviewContent(webviewView.webview);
    webviewView.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case 'content':
          console.log(message);
          break;
        case 'reload':

            break;
        default:
          console.log(message);
          break;
      }
    });
  }

  getWebviewContent(
    webview: vscode.Webview,
    markdownText: string = ''
  ): string {
    const htmlContent = marked(markdownText)!;
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>AI Interaction</title>
          <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
          <style>
        body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: flex-end;
            height: 100vh;
            background-color: #f7f7f7;
        }

        .textarea-wrapper {
            display: flex;
            align-items: flex-end;
            background-color: #fff;
            border: 1px solid #ccc;
            padding: 10px;
            box-sizing: border-box;
        }

        .contenteditable {
            border: none;
            outline: none;
            width: 300px; /* Adjust the width as needed */
            min-height: 50px;
            flex-grow: 1;
            padding: 10px;
            box-sizing: border-box;
            background-color: transparent;
            resize: none; /* Prevent resizing */
        }

        button {
            margin-left: 5px;
            padding: 5px 10px;
            cursor: pointer;
        }

        /* Style the buttons */
        #clear-btn {
            background-color: #f44336; /* Red */
            color: white;
            border: none;
        }

        #submit-btn {
            background-color: #4caf50; /* Green */
            color: white;
            border: none;
        }
        </style>
      </head>
      <body>
        <div class="textarea-wrapper">
            <div contenteditable="true" class="contenteditable" id="message" placeholder="Type your message here..."></div>
            <button type="button" id="clear-btn">Clear</button>
            <button type="button" id="submit-btn">Submit</button>
        </div>

        <script>
        // JavaScript to handle the clear and submit actions
        document.getElementById('clear-btn').addEventListener('click', function() {
            document.getElementById('message').innerText = '';
        });

        document.getElementById('submit-btn').addEventListener('click', function() {
            const message = document.getElementById('message').innerText;
            console.log('Submitted message:', message);
            // Add your submit logic here
        });
        </script>
      </body>
      </html>
      `;
  }
}

function generateUniqueId(): string {
  return '_' + Math.random().toString(36).substring(2, 9);
}

function getRandAFile(context: vscode.ExtensionContext): string {
  const storagePath = context.globalStorageUri.fsPath;
  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
  }

  const a_path = path.join(storagePath, 'RandA.json');
  if (!fs.existsSync(a_path)) {
    fs.writeFileSync(a_path, '[]');
  }

  return a_path;
}

function readJsonFile(filePath: string): JsonObject[] {
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data) as JsonObject[];
}

function writeJsonFile(filePath: string, data: JsonObject[]): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function addNewEntry(
  filePath: string,
  question: string,
  answer: string,
  modelName: string,
  temperature: string
): void {
  const data = readJsonFile(filePath);

  const newEntry: JsonObject = {
    id: generateUniqueId(),
    timestamp: new Date().toISOString(),
    question: question,
    answer: answer,
    modelName: modelName,
    temperature: temperature,
  };

  data.push(newEntry);
  writeJsonFile(filePath, data);
}

function removeOldEntries(filePath: string): void {
  const data = readJsonFile(filePath);
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const filteredData = data.filter(
    (entry) => new Date(entry.timestamp) >= threeMonthsAgo
  );
  writeJsonFile(filePath, filteredData);
}

function removeById(filePath: string, id: string): void {
  const data = readJsonFile(filePath);
  const filteredData = data.filter((entry) => entry.id !== id);

  if (filteredData.length !== data.length) {
    writeJsonFile(filePath, filteredData);
    showMessage(l10n.t('deleteObject', id), 'info'); // `Object with ID ${id} deleted.`
  } else {
    showMessage(l10n.t('objectNotFound', id), 'error'); // `No object found with ID ${id}.`
  }
}
