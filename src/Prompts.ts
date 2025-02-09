import { l10n } from "vscode";
import { getConfiguration, showMessage } from "./Utils";
import { getPromptStringFromWorkspaceFolder } from "./Functions";
import OpenAI from "openai";

export class Prompt {
  constructor(
    public name: string,
    public temperature: number,
    public prompt: string,
    public baseUrl: string,
    public modelName: string
  ) {}
}

export class PromptsManager {
  private static instance: PromptsManager;
  private prompts: Map<string, Prompt>;
  private openai: OpenAI | undefined;

  private constructor() {
    this.prompts = new Map();
    // Load prompts from the specified folder here
    // ... (implementation to read files and create Prompt objects)
    this.loadConfigurations();
  }

  public getOpenAI() {
    return this.openai;
  }

  public loadConfigurations() {
    const location: string = getConfiguration("modelLocation")!;
    const localModel: string = getConfiguration("localModel")!;
    const apiKey: string = getConfiguration("openaiApiKey")!;
    if (!apiKey && location === "Remote") {
      showMessage(
        l10n.t("keyNotSet"), // Model API key is not set in settings.
        "error"
      );
      process.env.OPENAI_API_KEY = apiKey;
    }
    if (!localModel && location === "Local") {
      showMessage(
        l10n.t("localModelNotSet", "Local model is not set in settings."),
        "error"
      );
    }

    let evaluate_promptString: string = getConfiguration("prompt")!;
    let update_promptString: string = getConfiguration("update_prompt")!;
    let cliche_promptString: string = getConfiguration("cliche_prompt")!;
    let chart_promptString: string = getConfiguration("chart_prompt")!;

    // if in current workspace root, there is prompt folder, then find the prompts in there and replace the one from settings.
    ({
      evaluate_promptString,
      update_promptString,
      cliche_promptString,
      chart_promptString,
    } = getPromptStringFromWorkspaceFolder(
      evaluate_promptString,
      update_promptString,
      cliche_promptString,
      chart_promptString
    ));

    if (!evaluate_promptString) {
      showMessage(
        l10n.t("promptNotSet", "OpenAI prompt is not set!"),
        "warning"
      );
      evaluate_promptString = `You are ASSISTANT , work as literary critic. Please evaluate the tension of the following chapter and give it a score out of 100. 
                Also, describe the curve of the tension changes in the chapter. 
                Point out the three most outstanding advantages and the three biggest disadvantages of the chapter. 
                If you find any typographical errors, please point them out. 
                \n\nUSER: $PROMPT$ \n\nASSISTANT: `;
    }

    if (!update_promptString) {
      showMessage(
        l10n.t("promptNotSet", "OpenAI update prompt is not set!"),
        "warning"
      );
      update_promptString = `You are an editor. Please update below sentences, to make them more attractive, readable and natrural. \nUSER: $PROMPT$ \nASSISTANT:`;
    }

    if (!cliche_promptString) {
      showMessage(
        l10n.t("promptNotSet", "OpenAI update prompt is not set!"),
        "warning"
      );
      cliche_promptString = `You are an editor. Please update below sentences, to make them more attractive, readable and natrural. \nUSER: $PROMPT$ \nASSISTANT:`;
    }

    if (!chart_promptString) {
      showMessage(
        l10n.t("promptNotSet", "OpenAI update prompt is not set!"),
        "warning"
      );
      chart_promptString = `You are an editor. Please update below sentences, to make them more attractive, readable and natrural. \nUSER: $PROMPT$ \nASSISTANT:`;
    }
    if (location === "Remote") {
      this.openai = new OpenAI();
    } else {
      this.openai = new OpenAI({
        baseURL: "http://localhost:11434/v1",
        apiKey: "ollama", // required but unused
      });
    }
  }

  public static getInstance(): PromptsManager {
    if (!PromptsManager.instance) {
      PromptsManager.instance = new PromptsManager();
    }
    return PromptsManager.instance;
  }

  public getPromptByName(name: string): Prompt | undefined {
    return this.prompts.get(name);
  }

  // Add methods for adding, updating, and removing prompts if needed
}
