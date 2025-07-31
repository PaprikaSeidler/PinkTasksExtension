const vscode = require('vscode');
const path = require('path');

class TagManager {
    constructor() {
        this.configFileName = 'pinktasks.json';
        this.defaultTags = ['TODO', 'FIXME', 'NOTE', 'HACK', 'BUG'];
    }

    getPath() {
        if (!vscode.workspace.workspaceFolders) return null;
        return path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, this.configFileName);
    }

    async loadTags() {
        const configPath = this.getPath();
        if (!configPath) {
            return this.defaultTags;
        }

        try {
            const configUri = vscode.Uri.file(configPath);
            const content = await vscode.workspace.fs.readFile(configUri);
            const config = JSON.parse(content.toString());
            return [...this.defaultTags, ...(config.customTags || [])];
        }
        catch (error) {
            return this.defaultTags;
        }
    }

    async saveTags(customTags) {
        const configPath = this.getPath();
        if (!configPath) {
            return false;
        }

        try {
            const config = {customTags};
            const configContent = JSON.stringify(config, null, 2);
            const configUri = vscode.Uri.file(configPath);
            await vscode.workspace.fs.writeFile(configUri, Buffer.from(configContent));
            return true;
        }
        catch (error) {
            return false;
        }
    }

    async addTag(newTag) {
        const currentTags = await this.loadTags();
        const customTags = currentTags.filter(tag => !this.defaultTags.includes(tag));
        
        if (!currentTags.includes(newTag.toUpperCase())) {
            customTags.push(newTag.toUpperCase());
            return await this.saveTags(customTags);
        }
        return false;
    }

    async  removeTag(tagToRemove) {
    const currentTags = await this.loadTags();
    const customTags = currentTags.filter(tag => 
        !this.defaultTags.includes(tag) && tag !== tagToRemove
    );
    return await this.saveTags(customTags);
    }
}

module.exports = TagManager;

