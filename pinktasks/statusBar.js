const vscode = require('vscode');

class StatusBar {

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.statusBarItem.command = 'pinktasks.updateStatusBar';
        this.statusBarItem.show();
    }

    update(count) {
        this.statusBarItem.text = `$(checklist) Tasks: ${count}`;
    }

    dispose() {
        this.statusBarItem.dispose();
    }

}

module.exports = StatusBar;
