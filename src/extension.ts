"use strict";
import * as vscode from "vscode";
import { register2VSCode } from "./commands";

export function activate(context: vscode.ExtensionContext) {
  register2VSCode(context);
}
