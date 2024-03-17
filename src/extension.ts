'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as CryptoJS from 'crypto';
import OpenAI from 'openai';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const storagePath = context.globalStoragePath
    if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath, { recursive: true });
    }
    const apiKey: string = vscode.workspace.getConfiguration('vscodeChapterEval').get('openaiApiKey')!;
    if (!apiKey) {
        vscode.window.showErrorMessage('OpenAI API key is not set in settings.');
        return;
    }


    let disposable = vscode.commands.registerCommand('vscodeChapterEval.evaluateMarkdown', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No open Markdown file.');
            return;
        }
        if (editor.document.languageId != "markdown") {
            vscode.window.showInformationMessage('This is not a Markdown file.');
            return;
        }

        let promptString: string = vscode.workspace.getConfiguration('vscodeChapterEval').get('prompt')!;
        if (!promptString) {
            vscode.window.showWarningMessage('OpenAI prompt is not set!');
            promptString = `You are ASSISTANT , work as literary critic. Please evaluate the tension of the following chapter and give it a score out of 100. 
            Also, describe the curve of the tension changes in the chapter. 
            Point out the three most outstanding advantages and the three biggest disadvantages of the chapter. 
            If you find any typographical errors, please point them out. 
            \n\nUSER: $PROMPT$ \n\nASSISTANT: `
        }

        const documentText = editor.document.getText();
        // Proceed to evaluate the documentText with OpenAI and handle the result
        // calculate its hash, if we have done that before, it will be save in your local disk, just read from there
        const stringHash = digest(documentText);
        const resultFilePath = path.join(storagePath, stringHash + '.md');
        promptString = promptString.replace('$PROMPT$', documentText)
        if (!fs.existsSync(resultFilePath)) {
            // does not exist, call openAi to make it.
            const openai = new OpenAI();
            process.env.OPENAI_API_KEY = apiKey
            await openai.chat.completions.create({
                model: "gpt-4-0125-preview",
                messages: [{ role: "system", content: promptString }],
                temperature: 0.7,
                max_tokens: 4096,
            }).then(data => {
                return JSON.stringify(data);
            }).then(data => {
                const evalContent = JSON.parse(data);
                writeToLocal(resultFilePath, evalContent.choices[0]['message']['content']);
            }).catch(err => {
                vscode.window.showErrorMessage(err.message)
            })

        }

        if (fs.existsSync(resultFilePath)) {
            displayMarkdownFromFile(resultFilePath);
        }
    });
    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

export function displayMarkdownFromFile(filePath: string) {
    const uri = vscode.Uri.file(filePath);
    vscode.commands.executeCommand('markdown.showPreview', uri);
}

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

export function digest(message: string) {
    return CryptoJS.createHash('sha1').update(message.replace(/\s/g, ''), 'utf8').digest('hex');
}

export function writeToLocal(fileName: string, fileContent: string): string {


    fs.writeFileSync(fileName, fileContent, 'utf8');
    vscode.window.showInformationMessage(`Evaluation result saved to ${fileName}`);
    return fileName;

}