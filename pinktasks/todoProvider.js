const vscode = require('vscode');

class TodoProvider {

    constructor() {
        this.todos = [];
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }

    refresh(updatedTodos) {
        const existing = this.todos.filter(t => t.file !== updatedTodos.file);
        //this.todos = [...existing, ...updatedTodos]; // ... spread operator to merge arrays
        this.todos = updatedTodos; // Replace with the new todos
        this._onDidChangeTreeData.fire();
    }

    getTasks() {
        return this.todos;
    }

    getTreeItem(element) {
        if (element.tasks) {
            const item = new vscode.TreeItem(element.file, vscode.TreeItemCollapsibleState.Expanded);
            return item;
        }
        else {
            const item = new vscode.TreeItem(element.task, vscode.TreeItemCollapsibleState.None);
            item.tooltip = `${element.task}`;
            item.description = true;
            item.command = {
                command: 'pinktasks.openFile',
                title: 'Open Task',
                arguments: [element.file, element.line]
            };
            return item;
        }
    }

    getChildren(element) {
        if (!element) {
            return this.todos;        
        }
        else if (element.tasks) {
            return element.tasks.map(task => ({
                file: element.file,
                task: task.task,
                line: task.line
            }));
        }
        else {
            return [];
        }
    }

}

module.exports = TodoProvider; 