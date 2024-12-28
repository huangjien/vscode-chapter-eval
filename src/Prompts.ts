class Prompt {
  constructor(
    public name: string,
    public temperature: number,
    public prompt: string,
    public baseUrl: string,
    public modelName: string
  ) {}
}

class PromptsManager {
  private static instance: PromptsManager;
  private prompts: Map<string, Prompt>;

  private constructor() {
    this.prompts = new Map();
    // Load prompts from the specified folder here
    // ... (implementation to read files and create Prompt objects)
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
