// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const TodoProvider = require('./todoProvider.js');
const StatusBar = require('./statusBar.js');
const { highlightTodos } = require('./decoration.js');

let statusBar;

/**
 * @param {vscode.ExtensionContext} context 
 */
function activate(context) {

	const todoProvider = new TodoProvider();
	vscode.window.registerTreeDataProvider('pinktasksView', todoProvider);

	statusBar = new StatusBar();
	context.subscriptions.push(statusBar);

	vscode.commands.executeCommand('pinktasks.scanTasks');

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "pinktasks" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('pinktasks.helloWorld', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('You can now start using PinkTasks to manage your tasks!');
	});

	// Register the Scan Tasks command separately
	const scanTasksDisposable = vscode.commands.registerCommand('pinktasks.scanTasks', function () {
		
		let todos = {};

		vscode.workspace.findFiles('**/*.{js,ts,jsx,tsx,py,css,html,md,txt,json}', '**/node_modules/**')
			.then(files => {
				vscode.window.showInformationMessage(`Found ${files.length} files to scan for tasks`);
				
				Promise.all(
					files.map(file => vscode.workspace.openTextDocument(file).then(doc => {
						const lines = doc.getText().split('\n');
						const relPath = vscode.workspace.asRelativePath(file);
						lines.forEach((line, index) => {
							const match = line.match(/(?:\/\/|#|<!--|\/\*+)?\s*(TODO)\s*[:\-]?\s+([^-*>]*)/i);;
							if (match) {
								const taskType = match[1].toUpperCase();
								const taskDescription = match[2].trim();
								if (!todos[relPath]) {
									todos[relPath] = [];
								}
								todos[relPath].push({
									task: `${taskType}: ${taskDescription}`,
									line: index + 1
								});
							}
						});
						return null;
					})))
					.then(() => {
					const todoArray = Object.entries(todos).map(([file, tasks]) => ({
						file,
						tasks
					}));
					todoProvider.refresh(todoArray);

					const taskCount = todoArray.reduce((count, item) => count + item.tasks.length, 0);
					statusBar.update(taskCount);
				});
			});
	});

	const openFileDisposable = vscode.commands.registerCommand('pinktasks.openFile', (file, lineNo) => {
		const fullPath = vscode.Uri.file(`${vscode.workspace.workspaceFolders[0].uri.fsPath}/${file}`);
		vscode.workspace.openTextDocument(fullPath).then(doc => {
			vscode.window.showTextDocument(doc).then(editor => {
				const line = lineNo - 1; 
				const position = new vscode.Position(line, 0);
				const range = new vscode.Range(position, position);
				editor.selection = new vscode.Selection(position, position);
				editor.revealRange(range, vscode.TextEditorRevealType.InCenter);

				highlightTodos(editor, lineNo);
			});
		});
	});

	const fileSaveListener = vscode.workspace.onDidSaveTextDocument(event => {
		vscode.commands.executeCommand('pinktasks.scanTasks');
	});

	context.subscriptions.push(scanTasksDisposable);
	context.subscriptions.push(statusBar);
	context.subscriptions.push(openFileDisposable);
	context.subscriptions.push(fileSaveListener);
	context.subscriptions.push(disposable);
}


// This method is called when your extension is deactivated
function deactivate() { 
	if (statusBar) {
		statusBar.dispose();
	}
}

module.exports = {
	activate,
	deactivate
}
