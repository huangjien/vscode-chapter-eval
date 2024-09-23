# Editor AI

![GitHub](https://img.shields.io/github/license/huangjien/vscode-chapter-eval)

[English](https://github.com/huangjien/vscode-chapter-eval/blob/main/README.md) | [Chinese (Simplified - zh-cn): 中文（简体）](https://github.com/huangjien/vscode-chapter-eval/blob/main/README.zh-cn.md) | [Chinese (Traditional - zh-tw): 中文（繁體）](https://github.com/huangjien/vscode-chapter-eval/blob/main/README.zh-tw.md) | [Cantonese (Traditional - zh-hk): 中文（繁體.粤语）](https://github.com/huangjien/vscode-chapter-eval/blob/main/README.zh-hk.md)｜[Japanese (ja): 日本語](https://github.com/huangjien/vscode-chapter-eval/blob/main/README.ja.md) | [French (fr): Français](https://github.com/huangjien/vscode-chapter-eval/blob/main/README.fr.md) | [German (de): Deutsch](https://github.com/huangjien/vscode-chapter-eval/blob/main/README.de.md) | [Italian (it): Italiano](https://github.com/huangjien/vscode-chapter-eval/blob/main/README.it.md) | [Spanish (es): Español](https://github.com/huangjien/vscode-chapter-eval/blob/main/README.es.md) | [Portuguese (Brazilian - pt-br): Português (Brasil)](https://github.com/huangjien/vscode-chapter-eval/blob/main/README.pt-br.md) | [Russian (ru): Русский](https://github.com/huangjien/vscode-chapter-eval/blob/main/README.ru.md) | [Korean (ko): 한국어](https://github.com/huangjien/vscode-chapter-eval/blob/main/README.ko.md)

**Editor AI** è un'estensione di Visual Studio Code che sfrutta la potenza dell'IA per assistere gli autori nella valutazione dei capitoli dei loro romanzi. Questo strumento è stato progettato per aiutare gli scrittori ambiziosi e di经验丰富的作家i a ottenere un'introspezione sulla loro scrittura e per migliorare le loro abilità di scrittura.

### Scopo di questa estensione

Questa estensione mira a rendere reale il sogno di molti di scrivere un romanzo. Come programmatore che ha recentemente iniziato questo viaggio, ho sviluppato questo strumento per semplificare il processo di valutazione dei miei capitoli e per aiutarmi a migliorare le mie capacità narrative, senza dover passare laboriosamente da uno strumento all'altro.

### Caratteristiche principali

- **Supporto per file Markdown e testo**: Valutazione senza intoppi dei capitoli scritti in formato Markdown e testo.
- **Integrazione di AI**: Utilizzo di AI di OpenAI per analizzare la tensione narrativa e la qualità della scrittura.
- **Supporto per modelli locali**: A partire dalla versione 0.7.x, questa estensione inizia a supportare la valutazione con modelli locali (ollama), sebbene i risultati possano variare.
- **Interfaccia utente amichevole**: Comandi facilmente accessibili permettono una valutazione, una formattazione e una gestione del testo semplici.
- **Supporto lettura testo-voce**: Questa estensione vi permette anche di far leggere il testoselezionato.

Perché dovresti usarlo
Ogni scrittore dovrebbe avere fiducia nel proprio lavoro. Con l'Editor AI, è possibile ottenere feedback costruttivo sulle aree chiave della storia, come il ritmo, la tensione e lo sviluppo dei personaggi. Questa estensione non è solo per ottenere un punteggio; è per comprendere meglio la tua scrittura.

Ottenere la tua chiave API OpenAI
Per utilizzare questa estensione, ti serve una chiave API da OpenAI. Seguire questi passaggi per ottenerla:

Visitare il sito web di OpenAI, se non si dispone già di un account, si prega di crearne uno.
Fare clic sul pulsante "Crea nuova chiave".
Copia la chiave e incollarla nel campo "Chiave API" nelle impostazioni dell'estensione.
Configurare l'estensione
Nel tuo ambiente VS Code aggiorna le impostazioni di questa estensione per adattarle alle tue esigenze.

<img src="resources/setup.png" alt="Configurazione" />
Il prompt suggerito è il seguente:

Si prega di leggere il seguente capitolo del romanzo e di valutarlo in base agli standard seguenti. Valutare ogni elemento su una scala da 1 a 10 (1 è il punteggio più basso, 10 il più alto). Si prega di spiegare in dettaglio i motivi della valutazione e di citare specifici episodi o paragrafi a supporto:  
Attrattività della trama (1-10 punti): La trama di questo capitolo è affascinante? C'è un motivo per continuare a leggere? Valutare in base alla tensione, all'intrigo o all'interesse della trama. Punteggio: \_**\_ Motivazioni ed esempi:
Sviluppo dei personaggi (1-10 punti): I personaggi sono impressionanti? Le loro azioni e dialoghi hanno profondità e verosimiglianza? Valutare in base all'unicità dei personaggi e alla loro capacità di stabilire un legame emotivo con il lettore. Punteggio: \_\_** Motivazioni ed esempi:
Lingua e stile di scrittura (1-10 punti): L'autore scrive in modo chiaro e espresso, il testo scorre fluidamente? Valutare in base alla bellezza del linguaggio, alla coerenza della narrazione e alla capacità di trasmettere efficacemente emozioni e atmosfera. Punteggio: \_**\_ Motivazioni ed esempi:
Coinvolgimento emotivo (1-10 punti): Leggendolo, si prova una reazione emotiva (ad esempio, tensione, curiosità, eccitazione, ecc.)? Valutare in base alla capacità del testo di scatenare una forte risonanza emotiva. Punteggio: \_\_** Motivazioni ed esempi:
Suspense e anticipazione (1-10 punti): Questo capitolo crea suspense o lascia aperte domande, stimolando la voglia di continuare a leggere? Valutare in base alla capacità del capitolo di rimanere coinvolgente alla fine. Punteggio: \_**\_ Motivazioni ed esempi:
Attrattività complessiva (1-10 punti): Nel suo insieme, questo capitolo ti dà la spinta per continuare a leggere? Valutare in base all'espressione complessiva del capitolo e alla sua attrattività generale come inizio di romanzo. Punteggio: \_\_** Motivazioni ed esempi:
Si prega di assegnare un punteggio a ogni sezione e di spiegare il motivo della punteggio, citando episodi o paragrafi specifici a sostegno del tuo giudizio. Risolviamo questo problema lentamente e step by step, per assicurarci di ottenere il risultato di analisi corretto.

---

## $PROMPT$

Nota: $PROMPT$ dovrebbe rimanere invariato, poiché rappresenta il contenuto del capitolo corrente.

Come usare l'estensione
In un editor con i capitoli del romanzo:

Fai clic con il pulsante destro del mouse sul testo.
Seleziona "Valuta capitolo" dal menu contestuale.
<img src="resources/evaluate.png" alt="Valuta capitolo" />
Aspetta un momento e AI restituirà i risultati della valutazione e fornirà pregevoli indizi per la tua scrittura:

<img src="resources/evaluation_reslult.png" alt="Risultati della valutazione" />
Informazioni sui modelli locali
A partire dalla versione 0.7.x, è supportato l'uso di modelli locali, sebbene l'efficacia di diverse configurazioni e tipi di modelli possa variare.

L10N
Questo strumento supporta le seguenti lingue:

Cinese semplificato (zh-cn), Cinese tradizionale (zh-tw), Giapponese (ja), Francese (fr), Tedesco (de), Italiano (it), Spagnolo (es), Portoghese brasiliano (pt-br), Russo (ru) e Coreano (ko).

Limitazioni e feedback
Come prova di concetto, questa estensione potrebbe avere limitazioni o errori. Il tuo feedback e le tue contribuzioni sono essenziali per migliorarne le prestazioni. Se ti piace usarlo, considera di offrimi un caffè ☕️ per sostenere lo sviluppo futuro.

<div > <a href="https://www.buymeacoffee.com/huangjien" target="_blank" style="display: inline-block;"> <img src="https://img.shields.io/badge/Donate-Buy%20Me%20A%20Coffee-orange.svg?style=flat-square&logo=buymeacoffee" align="center" /> </a> </div> <br />
