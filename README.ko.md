# AI 에디터

![GitHub](https://img.shields.io/github/license/huangjien/vscode-chapter-eval)

[English](./README.md) | [Chinese (Simplified - zh-cn): 中文（简体）](./README.zh-cn.md) | [Chinese (Traditional - zh-tw): 中文（繁體）](./README.zh-tw.md) | [Cantonese (Traditional - zh-hk): 中文（繁體.粤语）](./README.zh-hk.md)｜[Japanese (ja): 日本語](./README.ja.md) | [French (fr): Français](./README.fr.md) | [German (de): Deutsch](./README.de.md) | [Italian (it): Italiano](./README.it.md) | [Spanish (es): Español](./README.es.md) | [Portuguese (Brazilian - pt-br): Português (Brasil)](./README.pt-br.md) | [Russian (ru): Русский](./README.ru.md) | [Korean (ko): 한국어](./README.ko.md)

**AI 에디터**는 Visual Studio Code 확장 기능으로, AI의 능력을 이용하여 작가들이 소설 장을 평가하는 데 도움을 줍니다. 이 도구는 욕심 많은 작가들과经验丰富的作家들이 자신의 쓰기에 대한 통찰력을 얻고, 쓸줄을 높이기 위해 만들어졌습니다.

### 이 확장의 목적

이 확장은 많은 사람들이 소설을 쓰는 꿈을 실현하기 위해 만들어졌습니다. 최근에 이 여정에 참여한 프로그래머로서, 저는 이 도구를 개발하여 제 장 평가 과정을 간소화하고, 서로 다른 도구間을 번거롭게 전환하지 않고叙说能力을 향상시킬 수 있도록 했습니다.

주요 특징
마크다운 및 텍스트 파일 지원: 마크다운 및 텍스트 파일 포맷으로 쓰여진 장을 수월하게 평가합니다.
AI 통합: OpenAI의 AI를 사용하여 이야기의 긴장감과 쓰기 품질을 분석합니다.
로컬 모델 지원: 0.7.x 버전부터 이 확장은 로컬 모델(ollama) 평가를 지원하기 시작했으며, 결과는 다를 수 있습니다.
사용자 친화적인 인터페이스: 쉽게 액세스할 수 있는 명령으로 평가, 포맷팅, 텍스트 관리가 간단합니다.
텍스트 음성 변환 지원: 이 확장은 또한 선택한 텍스트를 읽어주는 것이 가능합니다.
왜 사용해야 할까요
모든 작가들은 자신의 작품에 자신감을 가져야 합니다. AI 에디터를 통해, 이야기의 키 영역(리듬, 긴장감, 인물 발전 등)에 대한 건설적인 피드백을 얻을 수 있습니다. 이 확장은 점수를 얻기 위한 것이 아니라, 당신의 쓰기를 더 잘 이해하기 위한 것입니다.

OpenAI API 키 얻기
이 확장을 사용하려면 OpenAI로부터 API 키가 필요합니다. 아래 단계에 따라 하나를 얻으세요:

OpenAI의 웹사이트를 방문하고, 계정이 없으면 하나를 만드세요.
'새 키 만들기' 버튼을 클릭하세요.
키를 복사하여 확장 설정의 'API 키' 필드에 붙여넣으세요.
확장 설정
VS Code 환경에서 이 확장의 설정을 업데이트하여 필요에 따라 기능을 조정하세요.

<img src="resources/setup.png" alt="설정" />
제안된 프롬프트는 다음과 같습니다:

다음 소설 장을 읽고 다음 기준에 따라 평가하세요. 각 항목은 1에서 10점(1점이 가장 낮고 10점이 가장 높음)으로 평가합니다. 점수에 따라 자세한 이유를 설명하고, 구체적인 줄이나 단락을 인용해주세요:
시나리오 매력(1-10점): 이 장의 시나리오는 매력적입니까? 계속 읽고 싶은 동기가 있나요? 시나리오가 촘촘하고 재미있거나 미스테리가 있다면 점수를 매겨주세요. 평가: \_**\_ 이유 및 예:
인물 구성(1-10점): 인물이 인상적이십니까? 그들의 행동과 대화가 깊이 있고 진실성이 있나요? 인물이 독특하고, 독자와 감정적으로 연결할 수 있는지에 따라 점수를 매겨주세요. 평가: \_\_** 이유 및 예:
언어와 쓰기 스타일(1-10점): 작가의 쓰기清楚하고 표현력 있습니까? 글이 흐릿나요? 언어의 아름다움, 이야기의 연속성, 그리고 감정과 분위기를 효과적으로 전달할 수 있는지에 따라 점수를 매겨주세요. 평가: \_**\_ 이유 및 예:
감정적 참여(1-10점): 읽으면서는 감정 반응(긴장, 궁금, 흥분 등)이 있나요? 글이 강렬한 감정적 공감을 불러일으킬 수 있다면 점수를 매겨주세요. 평가: \_\_** 이유 및 예:
미스테리와 기대(1-10점): 이 장이 미스테리를 만들어냈거나, 풀지 못한 질문을 남겨서 읽고 싶은 욕망을 자극했나요? 장의 끝이 사람을 사로잡는지에 따라 점수를 매겨주세요. 평가: \_**\_ 이유 및 예:
전체적 매력(1-10점): 전반적으로, 이 장이 당신을 계속 읽게 만드는 충동을 줍니까? 장의 종합적 표현과 소설의 시작 부분으로서의 전체적 매력에 따라 점수를 매겨주세요. 평가: \_\_** 이유 및 예:
각 부분에 대한 점수를 부여하고, 구체적인 줄이나 단락을 인용하여 평가 이유를 설명해주세요. 이 문제를 점진적으로 해결해 나가며, 올바른 분석 결과를 얻을 수 있도록 합시다.

---

## $PROMPT$

참고: $PROMPT$ 는 현재 장의 내용을 나타내므로 변경하지 마세요.

확장 사용 방법
소설 장이 포함된 편집기 안에서:

텍스트를 마우스 오른쪽 버튼으로 클릭합니다.
컨텍스트 메뉴에서 "장 평가"를 선택합니다.
<img src="resources/evaluate.png" alt="장 평가" />
잠시 기다리면, AI는 평가 결과를 돌려보내고, 당신의 쓰기에 대한 가치 있는 통찰력을 제공합니다:

<img src="resources/evaluation_reslult.png" alt="평가 결과" />
로컬 모델에 대한 설명
0.7.x 버전부터 로컬 모델을 지원하며, 서로 다른 구성과 모델 유형의 유효성은 다를 수 있습니다.

L10N
이 도구는 다음 언어를 지원합니다:

简体中文 (zh-cn), 繁体中文 (zh-tw), 일본어 (ja), 프랑스어 (fr), 독일어 (de), 이탈리아어 (it), 스페인어 (es), 브라질 포르투갈어 (pt-br), 러시아어 (ru), 한국어 (ko).

제한 사항 및 피드백
컨셉 증명으로, 이 확장은 제한 사항이나 오류가 있을 수 있습니다. 귀하의 피드백과 기여는 그 성능을 향상시키는 데 매우 중요합니다. 사용해보신 후에 마음에 들면, Buy Me A Coffee ☕️를 통해 향후 개발을 지원해보세요.

<div > <a href="https://www.buymeacoffee.com/huangjien" target="_blank" style="display: inline-block;"> <img src="https://img.shields.io/badge/Donate-Buy%20Me%20A%20Coffee-orange.svg?style=flat-square&logo=buymeacoffee" align="center" /> </a> </div> <br />
