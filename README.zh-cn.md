# AI 编辑

![GitHub](https://img.shields.io/github/license/huangjien/vscode-chapter-eval)

[English](https://github.com/huangjien/vscode-chapter-eval/blob/main/README.md) | [Chinese (Simplified - zh-cn): 中文（简体）](https://github.com/huangjien/vscode-chapter-eval/blob/main/README.zh-cn.md) | [Chinese (Traditional - zh-tw): 中文（繁體）](https://github.com/huangjien/vscode-chapter-eval/blob/main/README.zh-tw.md) | [Cantonese (Traditional - zh-hk): 中文（繁體.粤语）](https://github.com/huangjien/vscode-chapter-eval/blob/main/README.zh-hk.md)｜[Japanese (ja): 日本語](https://github.com/huangjien/vscode-chapter-eval/blob/main/README.ja.md) | [French (fr): Français](https://github.com/huangjien/vscode-chapter-eval/blob/main/README.fr.md) | [German (de): Deutsch](https://github.com/huangjien/vscode-chapter-eval/blob/main/README.de.md) | [Italian (it): Italiano](https://github.com/huangjien/vscode-chapter-eval/blob/main/README.it.md) | [Spanish (es): Español](https://github.com/huangjien/vscode-chapter-eval/blob/main/README.es.md) | [Portuguese (Brazilian - pt-br): Português (Brasil)](https://github.com/huangjien/vscode-chapter-eval/blob/main/README.pt-br.md) | [Russian (ru): Русский](https://github.com/huangjien/vscode-chapter-eval/blob/main/README.ru.md) | [Korean (ko): 한국어](https://github.com/huangjien/vscode-chapter-eval/blob/main/README.ko.md)

**AI 编辑**是一个 Visual Studio Code 扩展，利用 AI 的能力来帮助作者评估他们的小说章节。该工具旨在帮助有抱负和经验丰富的作家获得对其写作的洞察，并提升他们的写作技巧。

### 此扩展的目的

此扩展旨在实现我们许多人写小说的梦想。作为一名最近开始这段旅程的程序员，我开发了这个工具，以简化我章节的评估过程，帮助我提升叙事能力，而不必在不同工具之间繁琐地切换。

### 主要特点

- **支持 Markdown 和纯文本文件**：无缝评估以 Markdown 和纯文本格式编写的章节。
- **AI 集成**：利用 OpenAI 的 AI 分析叙事张力和写作质量。
- **本地模型支持**：从 0.7.x 版本开始，该扩展开始支持本地模型（ollama）进行评估，尽管结果可能有所不同。
- **用户友好的界面**：易于访问的命令允许简单的评估、格式化和文本管理。
- **文本转语音支持**：该扩展还允许您朗读所选文本。

### 为什么您应该使用它

每位作家都应对自己的作品充满信心。通过AI 编辑，您可以获得针对故事关键领域（如节奏、张力和角色发展）的建设性反馈。这个扩展不仅仅是为了获得分数；它是为了更好地理解您的写作。

### 获取您的 OpenAI API 密钥

要使用此扩展，您需要从 OpenAI 获取 API 密钥。请按照以下步骤获取：

1. 访问 [OpenAI 的网站](https://platform.openai.com/account/api-keys)，如果您没有帐户，请创建一个。
2. 点击 `创建新密钥` 按钮。
3. 复制密钥并将其粘贴到扩展设置中的 `API 密钥` 字段。

### 配置扩展

在您的 VS Code 环境中更新此扩展的设置，以根据您的需求调整其功能。

<img src="resources/setup.png" alt="设置" />

建议的提示是：

```
请阅读以下小说章节，并根据以下标准进行评估，每项评分范围为 1 到 10 分（1 分为最低，10 分为最高）。请根据你的评分，详细解释原因，并引用具体情节或段落作为支撑：
情节吸引力（1-10 分）：这章的情节是否引人入胜？是否有让你继续阅读的动机？评分依据是情节是否紧凑、有趣或富有悬念。  评分：____ 原因及示例：
角色塑造（1-10 分）：角色是否令人印象深刻？他们的行为、对话是否具有深度和真实性？评分依据是角色是否有独特性，是否能与读者产生情感联系。  评分：____ 原因及示例：
语言与写作风格（1-10 分）：作者的写作是否清晰、富有表现力，文字是否流畅？评分依据是语言的优美程度、叙述的连贯性以及是否能有效传达情感与氛围。  评分：____ 原因及示例：
情感投入度（1-10 分）：你在阅读时是否有情感反应（如紧张、好奇、激动等）？评分依据是文字是否能够引发强烈的情感共鸣。  评分：____ 原因及示例：
悬念与期待（1-10 分）：这一章是否制造了悬念或留下了未解的问题，激发你继续阅读的欲望？评分依据是章节结尾是否足够抓人心弦。  评分：____ 原因及示例：
整体吸引力（1-10 分）：总体来说，这一章是否让你觉得有继续阅读的冲动？评分依据是章节的综合表现以及它作为小说开头的整体吸引力。  评分：____ 原因及示例：
请给出每个部分的评分，并解释你的评分理由，引用具体的情节片段来支持你的判断。让我们慢慢地、一步一步地解决这个问题，以确保我们得到正确的分析结果。
---
$PROMPT$
---
```

**注意：** `$PROMPT$` 应保持不变，因为它代表当前章节的内容。

### 如何使用扩展

在包含小说章节的编辑器中：

1. 右键单击文本。
2. 从上下文菜单中选择 "评估章节"。

<img src="resources/evaluate.png" alt="评估章节" />

稍等片刻，AI 将返回评估结果，为您的写作提供有价值的见解：

<img src="resources/evaluation_reslult.png" alt="评估结果" />

### 关于本地模型的说明

从 0.7.x 版本开始，支持本地模型，尽管不同配置和模型类型的有效性可能有所不同。

### L10N

此工具支持以下语言：

简体中文（zh-cn）、繁体中文（zh-tw）、日语（ja）、法语（fr）、德语（de）、意大利语（it）、西班牙语（es）、巴西葡萄牙语（pt-br）、俄语（ru）和韩语（ko）。

### 限制与反馈

作为概念验证，此扩展可能存在限制或错误。您的反馈和贡献对于改善其性能至关重要。如果您喜欢使用它，请考虑 [请我喝杯咖啡 ☕️](https://www.buymeacoffee.com/huangjien) 来支持未来的发展。

<div >
    <a href="https://www.buymeacoffee.com/huangjien" target="_blank" style="display: inline-block;">
        <img src="https://img.shields.io/badge/Donate-Buy%20Me%20A%20Coffee-orange.svg?style=flat-square&logo=buymeacoffee" align="center" />
    </a>
</div>
<br />
