import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	const disposable = vscode.commands.registerCommand(
		'duplicate-line-better.duplicateLine',
		async () => {

			const editor = vscode.window.activeTextEditor;

			if (editor === undefined) {
				return;
			}

			const selection = editor.selection;

			if (selection.isEmpty) {

				const currentLineNumber = selection.active.line;
				const currentLine = editor.document.lineAt(currentLineNumber);

				const eol =
					editor.document.eol === vscode.EndOfLine.CRLF
						? '\r\n'
						: '\n';

				const cursorCharacter = selection.active.character;

				const success = await editor.edit((editBuilder) => {
					editBuilder.insert(
						currentLine.range.end,
						eol + currentLine.text
					);
				});

				if (!success) {
					return;
				}

				const newPosition = new vscode.Position(
					currentLineNumber + 1,
					Math.min(cursorCharacter, currentLine.text.length)
				);

				editor.selection = new vscode.Selection(
					newPosition,
					newPosition
				);
			}

			else {

				const selectedText = editor.document.getText(selection);

				const insertPosition = selection.end;

				const success = await editor.edit((editBuilder) => {
					editBuilder.insert(
						insertPosition,
						selectedText
					);
				});

				if (!success) {
					return;
				}

				const startOffset = editor.document.offsetAt(insertPosition);
				const endOffset = startOffset + selectedText.length;

				const duplicateEnd = editor.document.positionAt(endOffset);

				// Выделяем только что созданную копию
				editor.selection = new vscode.Selection(
					insertPosition,
					duplicateEnd
				);
			}
		}
	);

	context.subscriptions.push(disposable);
}

export function deactivate() {}