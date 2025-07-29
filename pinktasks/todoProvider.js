const vscode = require('vscode');

class TodoProvider {

    constructor() {
        // Hardcoded data for test
    this.todos = [
      /* {
        file: 'index.js',
        tasks: [
          'TODO: Fix the header',
          'TODO: Add unit tests'
        ]
      },
      {
        file: 'app.html',
        tasks: [
          'TODO: Update layout',
          'TODO: Fix footer'
        ]
      } */
    ];

      this._onDidChangeTreeData = new vscode.EventEmitter();
      this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }

    refresh(todos) {
        this.todos = todos;
        this._onDidChangeTreeData.fire();
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
                arguments: [element.file, element.task]
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