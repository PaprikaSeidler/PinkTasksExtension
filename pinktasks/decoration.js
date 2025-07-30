const vscode = require('vscode');

const highligter = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(255, 105, 180, 0.4)', 
    borderRadius: '3px',
});

function highlightTodos(editor, lineNo) {
    if (!editor) return;
    const line = lineNo - 1;
    const range = new vscode.Range(line, 0, line, editor.document.lineAt(line).text.length);
    editor.setDecorations(highligter, [range]);

    setTimeout(() => {
        editor.setDecorations(highligter, []); // Clear decoration after 3 seconds
    }, 3000);
}

module.exports = {
    highlightTodos
};