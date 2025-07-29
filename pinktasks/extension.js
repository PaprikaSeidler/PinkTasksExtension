// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

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

		// Find all files in the workspace
		vscode.workspace.findFiles('**/*.{js,ts,jsx,tsx,py,css,html,md,txt,json}', '**/node_modules/**')
			.then(files => {
				vscode.window.showInformationMessage(`Found ${files.length} files to scan for tasks`);

				//TODO: Implement the logic to scan these files for tasks
				files.forEach(file => {
					vscode.workspace.openTextDocument(file).then(doc => {
						doc.getText().split('\n')
							.forEach(line => {
								if (line.includes('TODO') || line.includes('FIXME')) {
									vscode.window.showInformationMessage(`Task found in ${file.path}: ${line.trim()}`);
								}
							});
					});
				});
			});
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(scanTasksDisposable);
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
