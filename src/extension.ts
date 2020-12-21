// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { TextEncoder } from 'util';
import * as vscode from 'vscode';
import * as path from 'path';
import * as svelte from 'svelte/compiler';
import { TemplateNode } from 'svelte/types/compiler/interfaces';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "t-dot-svelte-vscode" is now active!');

	vscode.window.registerTreeDataProvider(
		't-dot-svelte-vscode.rawTextView',
		new UntranslatedTextProvider()
	);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('t-dot-svelte-vscode.replaceWithTranslation',
		async () => {
			// The code you place here will be executed every time your command is executed

			// Display a message box to the user
			const editor = vscode.window.activeTextEditor;
			if (!editor) return;

			let selectedText = editor.document.getText(editor.selection);

			let inputBox = vscode.window.createInputBox();
			inputBox.prompt = "new key for translation";
			inputBox.onDidAccept(async () => {
				inputBox.dispose();

				let stringsPath = await vscode.workspace.findFiles("**/strings*.json");
				if (stringsPath.length > 1) {
					vscode.window.showErrorMessage('t-dot-svelte-vscode found more than one strings.json file.');
					return;
				} else if (stringsPath.length == 0) {
					vscode.window.showErrorMessage('t-dot-svelte-vscode did not find a strings.json file.');
					return;
				}

				let strings = JSON.parse((await vscode.workspace.openTextDocument(stringsPath[0])).getText());

				strings.strings[inputBox.value] = { translations: { "en": selectedText } };

				await vscode.workspace.fs.writeFile(stringsPath[0], new TextEncoder().encode(JSON.stringify(strings, null, '  ')));

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


class UntranslatedTextProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
	constructor() { }

	getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
		return element;
	}

	async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
		if (element instanceof SvelteFile) {
			let source = (await vscode.workspace.openTextDocument(element.filePath)).getText();
			let result: vscode.TreeItem[] = [];

			try {
				//let processed = await svelte.preprocess(source, svelte_preproces.typescript());
				let parsed = svelte.parse(source);

				return getRawText(parsed.html).map(text => new UntranslatedText(text.trim()));
			} catch (e) {
				console.log(e);
				return [];
			}
		} else {
			let svelteFiles = await vscode.workspace.findFiles("**/*.svelte");
			let result: vscode.TreeItem[] = [];
			for (let i = 0; i < svelteFiles.length; i++) {
				let path = svelteFiles[i];
				let source = (await vscode.workspace.openTextDocument(path)).getText();

				try {
					//let processed = await svelte.preprocess(source, svelte_preproces.typescript());
					let parsed = svelte.parse(source);

					if (templateHasRawText(parsed.html)) {
						result.push(new SvelteFile(path, vscode.TreeItemCollapsibleState.Collapsed));
					}
				} catch (e) {
					console.log(e);
				}
			}
			return result;
		};
	}
}

function templateHasRawText(node: TemplateNode): boolean {
	if (!node.children) return node.type == "Text" && node.raw.replace(/\s+/, '').length != 0;
	return node.children.filter(nod => templateHasRawText(nod)).length != 0;
}

function getRawText(node: TemplateNode): string[] {
	if (!node.children) return node.type == "Text" && node.raw.replace(/\s+/, '').length != 0 ? [node.raw] : [];
	return node.children.map(nod => getRawText(nod)).reduce((prev, current) => prev.concat(current), []);
}

class SvelteFile extends vscode.TreeItem {
	constructor(
		public readonly filePath: vscode.Uri,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState
	) {
		super(path.basename(filePath.path), collapsibleState);
		this.tooltip = filePath.path;
		this.description = this.filePath.path;
	}
}

class UntranslatedText extends vscode.TreeItem {
	constructor(
		public readonly rawText: string,
	) {
		super(rawText.substring(0, Math.min(15, rawText.length)) + (rawText.length < 15 ? '' : '...'), vscode.TreeItemCollapsibleState.None);
		this.tooltip = rawText;
		this.description = this.label + '';
	}

}