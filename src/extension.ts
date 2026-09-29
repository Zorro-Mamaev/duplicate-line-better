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

				editor.selection = new vscode.Selection(
					insertPosition,
					duplicateEnd
				);
			}
		}
	);

	const duplicateNTimes = vscode.commands.registerCommand(
		'duplicate-line-better.duplicateNTimes',
		async () => {
			const editor = vscode.window.activeTextEditor;

			if (editor === undefined) {
				return;
			}

			const input = await vscode.window.showInputBox({
				title: 'Duplicate N Times',
				prompt: 'How many copies do you want?',
				value: '2',
				validateInput: (value) => {
					const count = Number(value);

					if (!Number.isInteger(count) || count < 1) {
						return 'Enter a positive integer';
					}

					if (count > 1000) {
						return 'Maximum: 1000';
					}

					return null;
				}
			});

			if (input === undefined) {
				return;
			}

			const count = Number(input);

			const selection = editor.selection;

			const eol =
				editor.document.eol === vscode.EndOfLine.CRLF
					? '\r\n'
					: '\n';

			if (selection.isEmpty) {
				const lineNumber = selection.active.line;
				const line = editor.document.lineAt(lineNumber);

				const textToInsert =
					(eol + line.text).repeat(count);

				await editor.edit((editBuilder) => {
					editBuilder.insert(
						line.range.end,
						textToInsert
					);
				});

				return;
			}

			const selectedText =
				editor.document.getText(selection);

			await editor.edit((editBuilder) => {
				editBuilder.insert(
					selection.end,
					selectedText.repeat(count)
				);
			});
		}
	);

	context.subscriptions.push(
		disposable,
		duplicateNTimes
	);
}

export function deactivate() {}
