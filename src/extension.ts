import * as vscode from 'vscode';

/* Копирует текущую строку или выделенный текст count раз */
async function duplicate(count: number) {
    const editor = vscode.window.activeTextEditor;

    // Если редактор не открыт, делать нечего
    if (editor === undefined) {
        return;
    }

    const selection = editor.selection;
    let text = editor.document.getText(selection);
    let position = selection.end;
    let separator = '';

    // Без выделения копируем строку целиком
    if (selection.isEmpty) {
        const line = editor.document.lineAt(selection.active.line);
        text = line.text;
        position = line.range.end;

        if (editor.document.eol === vscode.EndOfLine.CRLF) {
            separator = '\r\n';
        } else {
            separator = '\n';
        }
    }

    // Массив строк: собираем нужное число копий
    const copies: string[] = [];
    for (let i = 0; i < count; i++) {
        copies.push(separator + text);
    }

    // join('') объединяет все копии в одну строку
    await editor.edit(edit => {
        edit.insert(position, copies.join(''));
    });
}

/* VS Code вызывает эту функцию при включении расширения */
export function activate(context: vscode.ExtensionContext) {
    // Ctrl+Alt+D: вставить одну копию
    const one = vscode.commands.registerCommand(
        'duplicate-line-better.duplicateLine',
        async () => {
            await duplicate(1);
        }
    );

    // Ctrl+Alt+Shift+D: спросить, сколько копий нужно
    const many = vscode.commands.registerCommand(
        'duplicate-line-better.duplicateNTimes',
        async () => {
            if (vscode.window.activeTextEditor === undefined) {
                return;
            }

            const input = await vscode.window.showInputBox({
                title: 'Duplicate N Times',
                prompt: 'How many copies do you want?',
                value: '2'
            });

            // Нажали Esc — ничего не делаем
            if (input === undefined) {
                return;
            }

            const count = Number(input);

            // Разрешаем только целое число от 1 до 1000
            if (!Number.isInteger(count) || count < 1 || count > 1000) {
                vscode.window.showErrorMessage('Enter a whole number from 1 to 1000');
                return;
            }

            await duplicate(count);
        }
    );

    context.subscriptions.push(one, many);
}
