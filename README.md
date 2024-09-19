# Chapter Evaluator

**Chapter Evaluator** is a Visual Studio Code extension that leverages the capabilities of ChatGPT to assist authors in evaluating their novel chapters. This tool is designed to help both aspiring and seasoned writers gain insights into their writing and refine their craft.

### Purpose of This Extension

This extension aims to fulfill the dream many of us have of writing a novel. As a programmer who has recently embarked on this journey, I developed this tool to simplify the evaluation process of my chapters, helping me enhance my storytelling without the daunting hassle of navigating through separate tools.

### Key Features
- **Supports Markdown and Plain Text Files**: Evaluate chapters written in both Markdown and plain text formats seamlessly.
- **ChatGPT Integration**: Utilize the power of OpenAI's ChatGPT to analyze the narrative tension and quality of your writing.
- **Local Model Support**: From version 0.7.x onwards, the extension has begun supporting local models (ollama) for evaluation, although results may vary.
- **User-Friendly Interface**: Easily accessible commands allow for straightforward evaluations, formatting, and text management.
- **Text-To-Speech Support**: The extension also allows you to read your selected text aloud.

### Why You Should Use It
Every writer deserves to feel confident about their work. With Chapter Evaluator, you can receive constructive feedback that focuses on crucial areas of your story, such as pacing, tension, and character development. This extension is about more than just getting scores; it's about understanding your writing better.

### Obtaining Your OpenAI API Key
To use this extension, you will need an API key from OpenAI. Follow these steps to obtain one:
1. Visit [OpenAI's website](https://platform.openai.com/account/api-keys) and create an account if you don’t have one.
2. Click on the `Create new secret key` button.
3. Copy the key and paste it into the `API Key` field in the extension settings.

### Configuring the Extension
Update the settings for this extension in your VS Code environment to tailor its functionality to your needs.

<img src="resources/setup.png" alt="Settings" />

The default prompt for evaluating your chapters is:
```
You are ASSISTANT, work as a literary critic. Please evaluate the tension of the following chapter and give it a score out of 100. Also, describe the curve of the tension changes in the chapter. Point out the three most outstanding advantages and the three biggest disadvantages of the chapter. If you find any typographical errors, please point them out.
USER: $PROMPT$ 
ASSISTANT:
```
**Note:** The `$PROMPT$` should remain intact as it represents the content of the current chapter.

### How to Use the Extension
In your editor containing the novel chapter:
1. Right-click on the text.
2. From the context menu, select "Evaluate Chapter".

<img src="resources/evaluate.png" alt="Evaluate a chapter" />

Wait a moment for ChatGPT to return the evaluation, which will provide valuable insights into your writing:

<img src="resources/evaluation_reslult.png" alt="Evaluation result" />

### A Note on Local Models
Starting from version 0.7.x, local models are supported, though the effectiveness may vary with different configurations and model types.

### Limitations & Feedback
As a proof of concept, this extension may have limitations or bugs. Your feedback and contributions are invaluable for improving its performance. If you enjoy using it, please consider [buying me a coffee ☕️](https://www.buymeacoffee.com/huangjien) to support future developments.
<div >
    <a href="https://www.buymeacoffee.com/huangjien" target="_blank" style="display: inline-block;">
        <img src="https://img.shields.io/badge/Donate-Buy%20Me%20A%20Coffee-orange.svg?style=flat-square&logo=buymeacoffee" align="center" />
    </a>
</div>
<br />
