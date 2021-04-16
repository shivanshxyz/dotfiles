'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode_1 = require("vscode");
let regex = new RegExp(/(class=)/g, 'ig');
function fullDocumentRange(document) {
    const lastLineId = document.lineCount - 1;
    return new vscode_1.Range(0, 0, lastLineId, document.lineAt(lastLineId).text.length);
}
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    let editor = vscode_1.window.activeTextEditor;
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode_1.commands.registerCommand('extension.stayClassy', () => {
        // The code you place here will be executed every time your command is executed
        if (!editor)
            return;
        let selection = editor.selection;
        let range, text;
        // if there is no text, get the entire document
        if (selection.isEmpty) {
            range = fullDocumentRange(editor.document);
            text = editor.document.getText();
        }
        else {
            range = selection;
            text = editor.document.getText(selection);
        }
        // this function is where the editor is actually updated with the changed text
        editor.edit(builder => {
            let classyText = text.replace(new RegExp(/(class=)/g, 'ig'), 'className=');
            builder.replace(range, classyText);
        });
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map