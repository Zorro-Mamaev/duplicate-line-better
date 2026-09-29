import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "duplicate-line-better" is now active!');

	const disposable = vscode.commands.registerCommand('duplicate-line-better.duplicateLine', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor === undefined) {
			console.error("editor isn't open");
			return;
		}

		const curr_line = editor.selection.active.line;
		const line_text = editor.document.lineAt(curr_line).text;
		let new_line_text: string;

		let eol: string;

		if (editor.document.eol === vscode.EndOfLine.CRLF) {
			eol = '\r\n';
		} else {
			eol = '\n';
		}

		new_line_text = line_text;

		editor.edit((editBuilder) => {
			editBuilder.insert(
				editor.document.lineAt(curr_line).range.end,
			 	eol + new_line_text
			);
		});
	
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
