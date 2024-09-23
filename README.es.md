# Editor AI

![GitHub](https://img.shields.io/github/license/huangjien/vscode-chapter-eval)

[English](https://github.com/huangjien/vscode-chapter-eval/blob/main/README.md) | [Chinese (Simplified - zh-cn): 中文（简体）](https://github.com/huangjien/vscode-chapter-eval/blob/main/README.zh-cn.md) | [Chinese (Traditional - zh-tw): 中文（繁體）](https://github.com/huangjien/vscode-chapter-eval/blob/main/README.zh-tw.md) | [Cantonese (Traditional - zh-hk): 中文（繁體.粤语）](https://github.com/huangjien/vscode-chapter-eval/blob/main/README.zh-hk.md)｜[Japanese (ja): 日本語](https://github.com/huangjien/vscode-chapter-eval/blob/main/README.ja.md) | [French (fr): Français](https://github.com/huangjien/vscode-chapter-eval/blob/main/README.fr.md) | [German (de): Deutsch](https://github.com/huangjien/vscode-chapter-eval/blob/main/README.de.md) | [Italian (it): Italiano](https://github.com/huangjien/vscode-chapter-eval/blob/main/README.it.md) | [Spanish (es): Español](https://github.com/huangjien/vscode-chapter-eval/blob/main/README.es.md) | [Portuguese (Brazilian - pt-br): Português (Brasil)](https://github.com/huangjien/vscode-chapter-eval/blob/main/README.pt-br.md) | [Russian (ru): Русский](https://github.com/huangjien/vscode-chapter-eval/blob/main/README.ru.md) | [Korean (ko): 한국어](https://github.com/huangjien/vscode-chapter-eval/blob/main/README.ko.md)

**Editor AI** es una extensión de Visual Studio Code que utiliza la capacidad de la IA para ayudar a los autores a evaluar sus capítulos de novela. Esta herramienta está diseñada para ayudar a escritores ambiciosos y experimentados a obtener insights sobre su escritura y mejorar sus habilidades de escritura.

### El objetivo de esta extensión

Esta extensión busca hacer realidad el sueño de muchos de escribir una novela. Como programador que recientemente comenzó este viaje, desarrollé esta herramienta para simplificar el proceso de evaluación de mis capítulos, ayudándome a mejorar mi capacidad narrativa sin tener que cambiarse entre diferentes herramientas.

### Características principales

- **Soporte para archivos Markdown y texto plano**: Evaluación fluida de capítulos escritos en formatos Markdown y texto plano.
- **Integración con AI**: Utiliza AI de OpenAI para analizar la tensión narrativa y la calidad de la escritura.
- **Soporte para modelos locales**: A partir de la versión 0.7.x, esta extensión comenzó a admitir la evaluación con modelos locales (ollama), aunque los resultados pueden variar.
- **Interfaz de usuario amigable**: Comandos fácilmente accesibles permiten una evaluación, formateo y gestión de texto sencilla.
- **Soporte para la conversión de texto a voz**: Esta extensión también le permite leer en voz alta el texto seleccionado.

### Por quédebería usarlo

Cada escritor debe tener confianza en su obra. Con Editor AI, puede obtener retroalimentación constructiva sobre áreas clave de su historia, como el ritmo, la tensión y el desarrollo de personajes. Esta extensión no es solo para obtener puntuaciones; es para comprender mejor su escritura.

Cómo obtener su clave API de OpenAI
Para utilizar esta extensión, necesitará obtener una clave API de OpenAI. Siga estos pasos para obtenerla:

Visite el sitio web de OpenAI, si aún no tiene una cuenta, créela.
Haga clic en el botón "Crear nueva clave".
Copie la clave y péguela en el campo "Clave de API" en la configuración de la extensión.
Configuración de la extensión
En su entorno de VS Code, actualice la configuración de esta extensión para ajustarla a sus necesidades.

<img src="resources/setup.png" alt="Configuración" />
El prompt sugerido es:

Por favor, lea el siguiente capítulo de la novela y evalúelo de acuerdo con los siguientes criterios, con una puntuación del 1 al 10 (1 es el más bajo y 10 es el más alto). Proporcione una explicación detallada para cada puntuación, basada en su evaluación, y cite ejemplos específicos de tramas o párrafos para respaldar su puntuación:
Grado de atracción de la trama (1-10 puntos): ¿Es la trama de este capítulo atractivo? ¿Hay alguna razón para que desee continuar leyendo? La puntuación se basa en si la trama es compacta, interesante o llena de suspense. Puntuación: \_**\_ Razón y ejemplo:
Desarrollo de personajes (1-10 puntos): ¿Son los personajes impresionantes? ¿Tienen sus acciones y diálogos profundidad y autenticidad? La puntuación se basa en si los personajes son únicos y si logran conectarse emocionalmente con el lector. Puntuación: \_\_** Razón y ejemplo:
Lenguaje y estilo de escritura (1-10 puntos): ¿Es la escritura del autor clara y expresiva, y ¿fluye bien el texto? La puntuación se basa en la belleza del lenguaje, la coherencia de la narrativa y la capacidad para transmitir emociones y ambiente de manera efectiva. Puntuación: \_**\_ Razón y ejemplo:
Grado de involucramiento emocional (1-10 puntos): ¿Tuvo alguna reacción emocional al leer (como tensión, curiosidad, entusiasmo, etc.)? La puntuación se basa en si el texto puede desencadenar una fuerte resonancia emocional. Puntuación: \_\_** Razón y ejemplo:
Suspense y expectativa (1-10 puntos): ¿Este capítulo creó suspense o dejó preguntas sin responder, despertando su deseo de continuar leyendo? La puntuación se basa en si el final del capítulo es lo suficientemente cautivador. Puntuación: \_**\_ Razón y ejemplo:
Atracción general (1-10 puntos): En general, ¿este capítulo te hizo querer continuar leyendo? La puntuación se basa en el desempeño general del capítulo y su atracción como inicio de una novela. Puntuación: \_\_** Razón y ejemplo:
Por favor, proporcione la puntuación para cada sección y explique el motivo de su puntuación, citando fragmentos específicos para respaldar su juicio. Resolvamos este problema lentamente y paso a paso para asegurarnos de obtener el resultado de análisis correcto.

---

## $PROMPT$

Nota: $PROMPT$ debe mantenerse sin cambios, ya que representa el contenido del capítulo actual.

Cómo usar la extensión
En el editor que contiene el capítulo de la novela:

Haga clic derecho en el texto.
Seleccione "Evaluar Capítulo" en el menú contextual.
<img src="resources/evaluate.png" alt="Evaluar Capítulo" />
Espere un momento, y AI devolverá los resultados de la evaluación, proporcionando insights valiosos para su escritura:

<img src="resources/evaluation_reslult.png" alt="Resultado de la Evaluación" />
Acerca del modelo local
A partir de la versión 0.7.x, se admite el modelo local, aunque la efectividad puede variar con diferentes configuraciones y tipos de modelos.

L10N
Esta herramienta admite los siguientes idiomas:

Chino simplificado (zh-cn), chino tradicional (zh-tw), japonés (ja), francés (fr), alemán (de), italiano (it), español (es), portugués de Brasil (pt-br), ruso (ru) y coreano (ko).

Limitaciones y retroalimentación
Como una prueba de concepto, esta extensión puede tener limitaciones o errores. Su retroalimentación y contribuciones son cruciales para mejorar su desempeño. Si le gustó usarla, considere invitarme a un café ☕️ para apoyar el desarrollo futuro.

<div > <a href="https://www.buymeacoffee.com/huangjien" target="_blank" style="display: inline-block;"> <img src="https://img.shields.io/badge/Donar-Invítame%20a%20un%20Café-orange.svg?style=flat-square&logo=buymeacoffee" align="center" /> </a> </div> <br />
