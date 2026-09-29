import * as vscode from 'vscode';

/**
 * Activates the extension.
 *
 * Registers all commands provided by Duplicate Line Better.
 *
 * Commands:
 * - duplicate-line-better.duplicateLine
 *   Duplicates the current line or selected text once.
 *
 * - duplicate-line-better.duplicateNTimes
 *   Duplicates the current line or selected text multiple times.
 *
 * @param context VS Code extension context used to register disposables.
 */
export function activate(context: vscode.ExtensionContext) {

	/**
	 * Duplicates the current line or selected text once.
	 */
	const duplicateLine = vscode.commands.registerCommand(
		'duplicate-line-better.duplicateLine',
		async () => {

			const editor = vscode.window.activeTextEditor;

			// The command cannot work without an active text editor.
			if (editor === undefined) {
				return;
			}

			const selection = editor.selection;

			// Get the correct line separator used by the current document.
			const eol =
				editor.document.eol === vscode.EndOfLine.CRLF
					? '\r\n'
					: '\n';

			/*
			 * If nothing is selected, duplicate the entire line
			 * where the cursor is currently located.
			 */
			if (selection.isEmpty) {
				const lineNumber = selection.active.line;
				const line = editor.document.lineAt(lineNumber);

				await editor.edit((editBuilder) => {
					editBuilder.insert(
						line.range.end,
						eol + line.text
					);
				});

				return;
			}

			/*
			 * If text is selected, duplicate only the selected
			 * part instead of the entire line.
			 */
			const selectedText = editor.document.getText(selection);

			await editor.edit((editBuilder) => {
				editBuilder.insert(
					selection.end,
					selectedText
				);
			});
		}
	);


	/**
	 * Duplicates the current line or selected text a user-defined
	 * number of times.
	 *
	 * The number of copies is requested through a VS Code input box.
	 * Only positive integers from 1 to 1000 are accepted.
	 */
	const duplicateNTimes = vscode.commands.registerCommand(
		'duplicate-line-better.duplicateNTimes',
		async () => {

			const editor = vscode.window.activeTextEditor;

			// Stop if no text editor is currently active.
			if (editor === undefined) {
				return;
			}

			/*
			 * Ask the user how many additional copies should be created.
			 */
			const input = await vscode.window.showInputBox({
				title: 'Duplicate N Times',
				prompt: 'How many copies do you want?',
				value: '2',

				/*
				 * Validate the value while the user is typing.
				 * Only positive integer values are allowed.
				 */
				validateInput: (value) => {
					const count = Number(value);

					if (!Number.isInteger(count) || count < 1) {
						return 'Enter a positive integer';
					}

					// Prevent accidentally inserting an extreme amount of text.
					if (count > 1000) {
						return 'Maximum: 1000';
					}

					return null;
				}
			});

			// undefined means the input box was cancelled.
			if (input === undefined) {
				return;
			}

			const count = Number(input);
			const selection = editor.selection;

			// Preserve the document's current line-ending format.
			const eol =
				editor.document.eol === vscode.EndOfLine.CRLF
					? '\r\n'
					: '\n';

			/*
			 * No selection:
			 * duplicate the complete current line.
			 */
			if (selection.isEmpty) {
				const lineNumber = selection.active.line;
				const line = editor.document.lineAt(lineNumber);

				/*
				 * Example:
				 *
				 * line.text = "hello"
				 * count = 3
				 *
				 * textToInsert becomes:
				 *
				 * "\nhello\nhello\nhello"
				 */
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

			/*
			 * Selection exists:
			 * duplicate exactly the selected text.
			 */
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

	/*
	 * Register command disposables so VS Code can clean them up
	 * automatically when the extension is deactivated.
	 */
	context.subscriptions.push(
		duplicateLine,
		duplicateNTimes
	);
}


/**
 * Called when the extension is deactivated.
 *
 * No manual cleanup is currently required because registered
 * commands are stored inside context.subscriptions.
 */
export function deactivate() {}