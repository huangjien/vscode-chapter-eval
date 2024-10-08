# AI 編輯

![GitHub](https://img.shields.io/github/license/huangjien/vscode-chapter-eval)

[English](./README.md) | [Chinese (Simplified - zh-cn): 中文（简体）](./README.zh-cn.md) | [Chinese (Traditional - zh-tw): 中文（繁體）](./README.zh-tw.md) | [Cantonese (Traditional - zh-hk): 中文（繁體.粤语）](./README.zh-hk.md)｜[Japanese (ja): 日本語](./README.ja.md) | [French (fr): Français](./README.fr.md) | [German (de): Deutsch](./README.de.md) | [Italian (it): Italiano](./README.it.md) | [Spanish (es): Español](./README.es.md) | [Portuguese (Brazilian - pt-br): Português (Brasil)](./README.pt-br.md) | [Russian (ru): Русский](./README.ru.md) | [Korean (ko): 한국어](./README.ko.md)

**AI 編輯**係一個 Visual Studio Code 擴充套件，利用 AI 嘅能力嚟幫手作者評估佢哋嘅小說章節。呢個工具旨在幫手有抱負同經驗豐富嘅作家得到對佢哋寫作嘅洞察，並提升佢哋嘅寫作技巧。

### 呢個擴充套件嘅目的

呢個擴充套件旨在實現我哋好多人寫小說嘅夢想。作為一名最近開始呢段旅程嘅程序員，我開發咗呢個工具，以簡化我章節嘅評估過程，幫助我提升敘事能力，而唔使喺唔同工具之間繁瑣地切換。

### 主要特點

- **支援 Markdown 同純文字檔案**：無縫評估以 Markdown 同純文字格式編寫嘅章節。
- **AI 集成**：利用 OpenAI 嘅 AI 分析敘事張力同寫作質量。
- **本地模型支援**：由 0.7.x 版本開始，呢個擴充套件開始支援本地模型（ollama）進行評估，雖然結果可能會有所不同。
- **用戶友善嘅界面**：易於訪問嘅命令容許簡單嘅評估、格式化同文本文管理。
- **文本轉語音支援**：呢個擴充套件仲容許您朗讀所選文本。

### 點解您應該使用佢

每位作家都應該對自己嘅作品充滿信心。透過 AI 編輯，您可以獲得針對故事關鍵領域（好似節奏、張力同角色發展）嘅建設性反饋。呢個擴充套件唔單止係為咗獲得分數；佢係為咗更好地理解您嘅寫作。

### 攞到您嘅 OpenAI API 密匙

要使用呢個擴充套件，您需要從 OpenAI 攞到 API 密匙。請按照以下步驟攞到：

1. 訪問 [OpenAI 嘅網站](https://platform.openai.com/account/api-keys)，如果您冇戶口，請創建一個。
2. 撳 `創建新密匙` 掣。
3. 複製密匙並且將佢貼到擴充套件設定中嘅 `API 密匙` 欄位。

### 配置擴充套件

喺您嘅 VS Code 環境中更新呢個擴充套件嘅設定，以根据您的需求調整其功能。

<img src="resources/setup.png" alt="設定" />

建議嘅提示係：

```
請閱讀以下小說章節，並根據以下標準進行評估，每項评分範圍為 1 到 10 分（1 分為最低，10 分為最高）。請根據你嘅評分，詳細解釋原因，並引用具体情節或段落作為支持：
情節吸引力（1-10 分）：呢章嘅情節是否引人入勝？是否有令你繼續閱讀嘅動機？評分依據係情節是否緊湊、有趣或富有懸念。  評分：____ 原因及示例：
角色塑造（1-10 分）：角色是否令人印象深刻？佢哋嘅行為、對話是否具有深度同真實性？評分依據係角色是否有獨特性，是否能夠同讀者產生情感聯繫。  評分：____ 原因及示例：
語言同寫作風格（1-10 分）：作者嘅寫作是否清晰、富有表現力，文字是否流暢？評分依據係語言嘅美麗程度、敘述嘅連貫性以及是否能有效傳達情感與氛圍。  評分：____ 原因及示例：
情感投入度（1-10 分）：你喺閱讀時是否有情感反應（好似緊張、好奇、激動等）？評分依據係文字是否能夠引發強烈嘅情感共鳴。  評分：____ 原因及示例：
懸念同期待（1-10 分）：呢一章是否製造咗懸念或者留低咗未解嘅問題，激發你繼續閱讀嘅慾望？評分依據係章節結尾是否足夠抓人心弦。  評分：____ 原因及示例：
整體吸引力（1-10 分）：總體嚟講，呢一章是否令你觉得有繼續閱讀嘅衝動？評分依據係章節嘅綜合表現以及佢作為小說開頭嘅整體吸引力。  評分：____ 原因及示例：
請畀出每個部分嘅評分，並且解釋你嘅評分理由，引用具体嘅情節片段嚟支持你嘅判斷。等我哋慢慢哋、一步一步噉解決呢個問題，以確保我哋得到正確嘅分析結果。
---
$PROMPT$
---
```

**注意：** `$PROMPT$` 應該保持唔變，因為佢代表緊當前記章嘅內容。

### 點樣使用擴充套件

喺包含小說章節嘅編輯器入面：

1. 揸右擊文本。
2. 從上下文菜單中揀選 "評估章節"。

<img src="resources/evaluate.png" alt="評估章節" />

等陣子，AI 將會返嚟評估結果，為您嘅寫作提供有價值嘅見解：

<img src="resources/evaluation_reslult.png" alt="評估結果" />

### 关於本地模型嘅說明

由 0.7.x 版本開始，支援本地模型，雖然唔同配置同模型類型嘅有效性可能會有所不同。

### L10N

呢個工具支援以下語言：

簡體中文（zh-cn）、繁體中文（zh-tw）、日語（ja）、法語（fr）、德語（de）、意大利語（it）、西班牙語（es）、巴西葡萄牙語（pt-br）、俄語（ru）同韓語（ko）。

### 限制同反饋

作為概念驗證，呢個擴充套件可能存在限制或者錯誤。您嘅反饋同貢獻對於改善佢嘅性能至關重要。如果你鍾意使用佢，請考慮 [請我飲杯咖啡 ☕️](https://www.buymeacoffee.com/huangjien) 嚟支持未來嘅發展。

<div >
    <a href="https://www.buymeacoffee.com/huangjien"  target="_blank" style="display: inline-block;">
        <img src="https://img.shields.io/badge/Donate-Buy%20Me%20A%20Coffee-orange.svg?style=flat-square&logo=buymeacoffee"  align="center" />
    </a>
</div>
<br />
