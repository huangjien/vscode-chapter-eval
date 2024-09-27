# AI 編輯

![GitHub](https://img.shields.io/github/license/huangjien/vscode-chapter-eval)

[English](./README.md) | [Chinese (Simplified - zh-cn): 中文（简体）](./README.zh-cn.md) | [Chinese (Traditional - zh-tw): 中文（繁體）](./README.zh-tw.md) | [Cantonese (Traditional - zh-hk): 中文（繁體.粤语）](./README.zh-hk.md)｜[Japanese (ja): 日本語](./README.ja.md) | [French (fr): Français](./README.fr.md) | [German (de): Deutsch](./README.de.md) | [Italian (it): Italiano](./README.it.md) | [Spanish (es): Español](./README.es.md) | [Portuguese (Brazilian - pt-br): Português (Brasil)](./README.pt-br.md) | [Russian (ru): Русский](./README.ru.md) | [Korean (ko): 한국어](./README.ko.md)

**AI 編輯**是一個 Visual Studio Code 擴充套件，利用 AI 的能力來幫助作者評估他們的小說章節。該工具旨在幫助有抱負心和經驗豐富的作家獲得對他們寫作的洞察，並提升他們的寫作技巧。

### 此擴充套件的目的

此擴充套件旨在實現許多人寫小說的夢想。作為一名最近開始這段旅程的程式設計師，我開發了這個工具，以簡化我章節的評估過程，幫助我提升敘事能力，而不必在不同工具之間切來切去。

### 主要特點

- **支援 Markdown 同純文字檔**：無縫評估以 Markdown 同純文字格式撰寫的章節。
- **AI 集成**：利用 AI 分析敘事張力同寫作品質。
- **本地模型支援**：從 0.7.x 版本開始，該擴充套件開始支援本地模型（ollama）進行評估，儘管結果可能有所不同。
- **使用者友善的界面**：易於訪問的指令允許簡單的評估、格式化同文本文管理。
- **文本轉語音支援**：該擴充套件還允許您朗讀選定的文本。

### 為何您應該使用它

每位作家都應對自己的作品充滿信心。透過 AI 編輯，您可以獲得針對故事關鍵領域（如節奏、張力同角色發展）的建設性回饋。這個擴充套件不僅僅是為了獲得分數；它是為了更好地理解您的寫作。

### 取得您的 OpenAI API 金鑰

要使用此擴充套件，您需要從 OpenAI 獲得 API 金鑰。請按照以下步驟進行：

1. 瀏覽至 [OpenAI 的網站](https://platform.openai.com/account/api-keys)，如果您還沒有帳號，請建立一個。
2. 按下「建立新金鑰」按鈕。
3. 複製金鑰並將其貼到擴充套件設定中的「API 金鑰」欄位。

### 配置擴充套件

在您的 VS Code 環境中更新此擴充套件的設定，以根據您的需求調整其功能。

<img src="resources/setup.png" alt="設定" />

建議的提示是：

```
請閱讀以下小說章節，並根據以下標準進行評估，每項評分範圍為 1 到 10 分（1 分為最低，10 分為最高）。請根據您的評分，詳細說明原因，並引用具體情節或段落作為證明：
情節吸引力（1-10 分）：這章的情節是否引人入勝？是否有讓您想要繼續閱讀的動力？評分依據是情節是否緊湊、有趣或充滿懸念。  評分：____ 原因及示例：
角色塑造（1-10 分）：角色是否令人印象深刻？他們的行為、對話是否具有深度和真實性？評分依據是角色是否具有獨特性，是否能與讀者建立情感連結。  評分：____ 原因及示例：
語言與寫作風格（1-10 分）：作者的寫作是否清晰、富有表現力，文字是否流暢？評分依據是語言的優美程度、敘述的連貫性以及是否能夠有效傳達情感與氛圍。  評分：____ 原因及示例：
情感投入度（1-10 分）：您在閱讀時是否有情感反應（如緊張、好奇、激動等）？評分依據是文字是否能夠引起強烈的情感共鳴。  評分：____ 原因及示例：
懸念與期待（1-10 分）：這一章是否製造了懸念或留下未解的問題，激發您繼續閱讀的慾望？評分依據是章節結尾是否足夠扣人心弦。  評分：____ 原因及示例：
整體吸引力（1-10 分）：總體來說，這一章是否讓您覺得有繼續閱讀的衝動？評分依據是章節的綜合表現以及它作為小說開頭的整體吸引力。  評分：____ 原因及示例：
請提供每個部分的評分，並解釋您的評分理由，引用具體的情節片段來支持您的判斷。讓我們慢慢來、一步一步解決這個問題，以確保我們得到正確的分析結果。
---
$PROMPT$
---
```

**注意：** `$PROMPT$` 應保持不變，因為它代表當前章節的內容。

### 如何使用擴充套件

在包含小說章節的編輯器中：

1. 右鍵點擊文本。
2. 從上下文選單中選擇「評估章節」。

<img src="resources/evaluate.png" alt="評估章節" />

稍等片刻，AI 將會傳回評估結果，為您的寫作提供有價值的見解：

<img src="resources/evaluation_reslult.png" alt="評估結果" />

### 關於本地模型的說明

從 0.7.x 版本開始，支援本地模型，儘管不同配置和模型類型的效能可能有所不同。

### L10N

此工具支援以下語言：

簡體中文（zh-cn）、繁體中文（zh-tw）、日語（ja）、法語（fr）、德語（de）、意大利語（it）、西班牙語（es）、巴西葡萄牙語（pt-br）、俄語（ru）同韓語（ko）。

### 限制與反饋

作為一個概念驗證，此擴充套件可能有限制或錯誤。您的反饋和貢獻對於改進其效能非常重要。如果您喜歡使用它，請考慮 [請我喝杯咖啡 ☕️](https://www.buymeacoffee.com/huangjien) 來支持未來的發展。

<div >
    <a href="https://www.buymeacoffee.com/huangjien"  target="_blank" style="display: inline-block;">
        <img src="https://img.shields.io/badge/Donate-Buy%20Me%20A%20Coffee-orange.svg?style=flat-square&logo=buymeacoffee"  align="center" />
    </a>
</div>
<br />
