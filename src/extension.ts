// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "t-dot-svelte-vscode" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('t-dot-svelte-vscode.replaceWithTranslation',
		() => {
			// The code you place here will be executed every time your command is executed

			// Display a message box to the user

			const editor = vscode.window.activeTextEditor;
			if (!editor) return;

			let selection = editor.document.getText(editor.selection);

			let inputBox = vscode.window.createInputBox();
			inputBox.prompt = "new key for translation";
			inputBox.onDidAccept(() => {
				inputBox.dispose();
				editor.edit(edit => {
					edit.replace(editor.selection, `<T key="${inputBox.value}" />`);
				});
			});
			inputBox.onDidHide(_ => inputBox.dispose());
			inputBox.show();
		});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
