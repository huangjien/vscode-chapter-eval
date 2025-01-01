import * as l10n from '@vscode/l10n';
import OpenAI from 'openai';
import * as vscode from 'vscode';
import { ChartWebViewProvider } from '../providers/chartWebViewProvider';
import { extractJsonFromString } from '../Utils';
import { callAI } from '../Functions';
import {
  showMessage,
  isMarkdownOrPlainText,
  showStatusBarProgress,
} from '../Utils';

export function registerCommandOfGenerateChart(
  context: vscode.ExtensionContext,
  chartProvider: ChartWebViewProvider,
  openai: OpenAI,
  model: string,
  chart_promptString: string,
  temperature: number
) {
  context.subscriptions.push(
    vscode.commands.registerCommand('vscodeChapterEval.generateChart', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        showMessage(
          l10n.t('noOpenMarkdownFile'), // No open Markdown file.
          'info'
        );
        return;
      }
      if (!isMarkdownOrPlainText(editor)) {
        showMessage(
          l10n.t('notMarkdownFile'), // Not a Markdown file.
          'info'
        );
        return;
      }
      // call openai generate chart data
      const text = editor.document.getText();
      const prompt = chart_promptString.replace('$PROMPT$', text);
      const longRunTask = callAI(openai, model, prompt, temperature).then(
        (data) => {
          const evalContent = JSON.parse(data);
          //evalContent need to be handled here
          const content = extractJsonFromString(
            evalContent.choices[0]['message']['content']
          );
          console.log(content);
          const event = content.curve.map((item: { event: any }) => item.event); // X轴: 事件描述
          const tensionValues = content.curve.map(
            (item: { tension: any }) => item.tension
          ); // Y轴: 张力
          const emotionValues = content.curve.map(
            (item: { emotion: any }) => item.emotion
          ); // Y轴: 情绪
          console.log(event, tensionValues, emotionValues);
          chartProvider.updateContent(event, tensionValues, emotionValues);
        }
      );
      showStatusBarProgress(longRunTask);
    })
  );
}
