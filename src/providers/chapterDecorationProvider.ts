"use strict";
import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { getAnalysisFolder } from "../Utils";

export class ChapterDecorationProvider
  implements vscode.FileDecorationProvider
{
  async provideFileDecoration(uri: vscode.Uri) {
    // if it is in Analysis folder, ignore it
    // if it is in the project root folder, ignore it
    if (uri.fsPath.endsWith(".md")) {
      const fileName = path.basename(uri.fsPath);
      // const data = fs.readFileSync(fileName).toString();

      // const [text_length, non, invisible] = countChineseString(data);
      const filePath = path.join(getAnalysisFolder() ?? "", fileName);
      if (fs.existsSync(filePath)) {
        return {
          badge: " ✔️",
          propagate: true,
          tooltip: "Evaluated",
        };
      } else {
        return {
          badge: " ⏳",
          propagate: true,
          tooltip: "Non Evaluated",
        };
      }
    }
  }
}
