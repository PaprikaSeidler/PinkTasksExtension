// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const TaskManager = require('./taskManager.js');
const StatusBar = require('./statusBar.js');
const { highlightTodos } = require('./decoration.js');
const ExportTasks = require('./exportTasks.js');
const TagManager = require('./tagManager.js'); // ÆNDRING: Tilføjet TagManager import for separation of concerns

let statusBar;

/**
 * @param {vscode.ExtensionContext} context 
 */
function activate(context) {

	const taskManager = new TaskManager();
	vscode.window.registerTreeDataProvider('pinktasksView', taskManager);

	statusBar = new StatusBar();
	context.subscriptions.push(statusBar);

	const exportTasks = new ExportTasks();
	const tagManager = new TagManager();

	vscode.commands.executeCommand('pinktasks.scanTasks');

	// This line of code will only be executed once when your extension is activated
	console.log('The extension "pinktasks" is now active!');

	// Register commands
	const scanTasksDisposable = vscode.commands.registerCommand('pinktasks.scanTasks', async function () {
		const taskTag = await tagManager.loadTags();
		const tagPattern = taskTag.join('|');
		const regex = new RegExp(`(?:\\/\\/|#|<!--|\\/\\*+)?\\s*(${tagPattern})\\s*[:\\-]?\\s+([^-*>]*)`, 'i');

		let todos = {};

		vscode.workspace.findFiles('**/*.{js,ts,jsx,tsx,py,css,html,md,txt,json}', '**/node_modules/**')
			.then(files => {
				if (files.length === 0) {
					vscode.window.showInformationMessage('No files found to scan for tasks.');
					return;
				}
				
				Promise.all(
					files.map(file => vscode.workspace.openTextDocument(file).then(doc => {
						const lines = doc.getText().split('\n');
						const relPath = vscode.workspace.asRelativePath(file);

						lines.forEach((line, index) => {
							const match = line.match(regex);
							if (match) {
								const taskType = match[1].toUpperCase();
								const taskDescription = match[2].trim();
								if (!todos[relPath]) {
									todos[relPath] = [];
								}
								todos[relPath].push({
									task: `[${taskType}] ${taskDescription}`,
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
					taskManager.refresh(todoArray);

					const taskCount = todoArray.reduce((count, item) => count + item.tasks.length, 0);
					statusBar.update(taskCount);
				});
			});
	});
	
	const addTagDisposable = vscode.commands.registerCommand('pinktasks.addTag', async () => {
		const newTag = await vscode.window.showInputBox({
			prompt: 'Enter a new tag to add to your tasks',
			placeHolder: 'New tag e.g., REVIEW, IMPORTANT',
		});

		if (newTag) {
			const success = await tagManager.addTag(newTag);
			if (success) {
				vscode.window.showInformationMessage(`Added new tag: ${newTag.toUpperCase()}`);
				vscode.commands.executeCommand('pinktasks.scanTasks');
			} else {
				vscode.window.showErrorMessage(`Tag "${newTag.toUpperCase()}" already exists or couldn't be saved.`);
			}
		}
	});

	const removeTagDisposable = vscode.commands.registerCommand('pinktasks.removeTag', async () => {
		const currentTags = await tagManager.loadTags();
		const customTags = currentTags.filter(tag => !tagManager.defaultTags.includes(tag));
		
		if (customTags.length === 0) {
			vscode.window.showInformationMessage('No custom tags to remove.');
			return;
		}
		
		const tagToRemove = await vscode.window.showQuickPick(customTags, {
			placeHolder: 'Select a custom tag to remove',
		});

		if (tagToRemove) {
			const success = await tagManager.removeTag(tagToRemove);
			if (success) {
				vscode.window.showInformationMessage(`Removed tag: ${tagToRemove}`);
				vscode.commands.executeCommand('pinktasks.scanTasks');
			} else {
				vscode.window.showErrorMessage('Failed to remove tag.');
			}
		}
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
	
	const exportJsonDisposable = vscode.commands.registerCommand('pinktasks.exportTasksJson', async () => {
		exportTasks.exportJson(taskManager.getTasks());
	});

	const exportMarkdownDisposable = vscode.commands.registerCommand('pinktasks.exportTasksMarkdown', async () => {
		exportTasks.exportMarkdown(taskManager.getTasks());
	});

	const markAsDoneDisposable = vscode.commands.registerCommand('pinktasks.markAsDone', async (task) => {
		const currentTags = await tagManager.loadTags();
		await taskManager.markAsDone(task, currentTags);
		vscode.commands.executeCommand('pinktasks.scanTasks');
	});

	context.subscriptions.push(scanTasksDisposable);
	context.subscriptions.push(statusBar);
	context.subscriptions.push(addTagDisposable);
	context.subscriptions.push(removeTagDisposable);
	context.subscriptions.push(openFileDisposable);
	context.subscriptions.push(fileSaveListener);
	context.subscriptions.push(exportJsonDisposable, exportMarkdownDisposable);
	context.subscriptions.push(markAsDoneDisposable);
}



function deactivate() { 
	if (statusBar) {
		statusBar.dispose();
	}
}

module.exports = {
	activate,
	deactivate
}
