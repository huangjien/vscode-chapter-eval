# Chapter Evaluator

This Visual Studio Code extension allows you to use ChatGPT to evaluate your novel chapter.

### Why I write this extension

Every person has a dream to write a novel some day. But we all left this dream behind when struggling in the real life.

Recently, I picked up this dream, started writing a novel. I don't want to publish it, don't want to be famous, just want to answer an old dream.

I am a programmer, so I put my novel in github, in markdown format. And use ChatGPT to evaluate every chapter. But it is not very convenient. And today is St. Patrick day, in Irealand, it is a public holiday. So I spent one day, finish this extension.

Hope one day, I can finish my novel.

---

In current version, the following format is supported:

1. Markdown file.
2. Plain text file.

_📢 **Warning:** default `ChatGPT Prompt` may not suits you, you'd better change to yours._

### Obtaining API key

To use this extension, you will need an API key from OpenAI. To obtain one, follow these steps:

1. Go to [OpenAI's website](https://platform.openai.com/account/api-keys). If you don't have an account, you will need to create one or sign up using your Google or Microsoft account.
2. Click on the `Create new secret key` button.
3. Copy the key and paste it into the `API Key` field in the extension settings.

### Configure Extension

In VS Code settings, update the settings for this extension.

<img src="resources/setup.png" alt="Settings" />

default prompt is:

```
You are ASSISTANT , work as literary critic. Please evaluate the tension of the following chapter and give it a score out of 100. Also, describe the curve of the tension changes in the chapter. Point out the three most outstanding advantages and the three biggest disadvantages of the chapter. If you find any typographical errors, please point them out. \nUSER: $PROMPT$ \nASSISTANT:
```

Note: the $PROMPT$ need to be kept, it represents the content of current chapter.

### How to use it

In the editor with your novel chapter, right click, in the context menu, select "Evaluate Chapter".

<img src="resources/evaluate.png" alt="Evaluate a chapter" />

You need to wait a while, the ChatGPT will return its evaluation. Like below:

<img src="resources/evaluation_reslult.png" alt="Evaluation result" />

This is an evaluation of Farewell to Arms

---

Note: From v0.7.x , it starts to support local models (ollama).

But the results are terrible (tested with llama3).

Hope in future, the local models will be more powerful and smarter.

---

Please note that this extension is currently a proof of concept and may have some limitations or bugs. We welcome feedback and contributions to improve the extension. If you enjoy this extension, please consider [buying me a coffee ☕️ ](https://www.buymeacoffee.com/huangjien) to support my work!

<div >
            <a href="https://www.buymeacoffee.com/huangjien" target="_blank" style="display: inline-block;">
                <img
                    src="https://img.shields.io/badge/Donate-Buy%20Me%20A%20Coffee-orange.svg?style=flat-square&logo=buymeacoffee" 
                    align="center"
                />
            </a></div>
<br />
