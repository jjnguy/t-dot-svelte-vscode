"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const util_1 = require("util");
const vscode = require("vscode");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "t-dot-svelte-vscode" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('t-dot-svelte-vscode.replaceWithTranslation', () => __awaiter(this, void 0, void 0, function* () {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        let selectedText = editor.document.getText(editor.selection);
        let inputBox = vscode.window.createInputBox();
        inputBox.prompt = "new key for translation";
        inputBox.onDidAccept(() => __awaiter(this, void 0, void 0, function* () {
            inputBox.dispose();
            let stringsPath = yield vscode.workspace.findFiles("**/strings*.json");
            if (stringsPath.length != 1) {
                vscode.window.showErrorMessage('t-dot-svelte-vscode requires a single strings*.json file.');
                return;
            }
            let strings = JSON.parse((yield vscode.workspace.openTextDocument(stringsPath[0])).getText());
            strings.strings[inputBox.value] = { translations: { "en": selectedText } };
            yield vscode.workspace.fs.writeFile(stringsPath[0], new util_1.TextEncoder().encode(JSON.stringify(strings, null, '  ')));
            editor.edit(edit => {
                edit.replace(editor.selection, `<T key="${inputBox.value}" />`);
            });
        }));
        inputBox.onDidHide(_ => inputBox.dispose());
        inputBox.show();
    }));
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map