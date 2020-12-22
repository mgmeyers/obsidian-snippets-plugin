import "./styles.scss";

var path = require('path');

// @ts-ignore
import extract from "./extract"

// @ts-ignore
import runner from "./runner"

import {
    Plugin,
    PluginManifest,
    MarkdownView,
    App,
    Modal,
    Notice,
    PluginSettingTab,
    Setting,
} from "obsidian";


export default class RunSnippets extends Plugin {
    constructor(app: App, pluginManifest: PluginManifest) {
        super(app, pluginManifest);
    }

    // This field stores your plugin settings.
    settings: RunSnippetsSettings;

    async onload() {

        console.log("Loading Run-Snippet-Plugin");
        this.settings = (await this.loadData()) || new RunSnippetsSettings();
        this.addSettingTab(new RunSnippetsSettingsTab(this.app, this));

        this.addCommand({
            id: "run-snippets",
            name: "Run snippet",
            callback: () => this.runSnippet(),
            hotkeys: [
                {
                    modifiers: ["Mod", "Shift"],
                    key: "Enter",
                },
            ],
        });

        this.registerInterval(
            window.setInterval(this.injectButtons.bind(this), 1000)
        );
    }

    injectButtons() {
        this.addRunButtons();
    }

    get_vars(): Promise<String> {
        let active_view = app.workspace.getActiveViewOfType(MarkdownView);
        if (active_view == null) {
            throw new Error("Active view is null");
        }

        let vaultPath = this.app.vault.adapter.basePath;
        let folder = active_view.file.parent.path;
        let fileName = active_view.file.name

        return {
            vault_path: vaultPath,
            folder: folder,
            file_name: fileName,
            file_path: path.join(vaultPath, folder, fileName),
            python: 'python3 -c'
        }
    }


    addRunButtons() {


        let vars = this.get_vars();
        document.querySelectorAll("pre > code").forEach(function (codeBlock) {
            const pre = codeBlock.parentNode;
            let isPython = pre.classList.contains(`language-python`);
            let isShell = pre.classList.contains(`language-shell`);
            let hasButton = pre.parentNode.classList.contains("has-run-button");

            if (!(isPython || isShell) || hasButton) {
                return;
            }

            pre.parentNode.classList.add("has-run-button");
            let button = document.createElement("button");
            button.className = "run-code-button";
            button.type = "button";
            button.innerText = "Run";

            let command = codeBlock.innerText;

            if (isPython) {
                command = apply_template('python', command, vars)
            } else if (isShell) {
                command = apply_template('shell', command, vars)
            } else {
                throw Error('not suported')
            }

            function runCommand(command: string) {
                const {exec} = require("child_process");
                button.innerText = "Running";
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        console.log(`error: ${error.message}`);
                        new Notice(error.message);
                        button.innerText = "error";
                        return;
                    }
                    if (stderr) {
                        console.error(`stderr: ${stderr}`);
                        new Notice(stderr);
                        button.innerText = "error";
                        return;
                    }
                    new Notice(stdout);
                    button.innerText = "Run";
                    console.log(`stdout: ${stdout}`);
                });
            }

            button.addEventListener("click", function () {
                runCommand(command);
            });

            pre.appendChild(button);
        });
    }

    runSnippet() {
        let vars = this.get_vars();


        const view = this.app.workspace.activeLeaf.view;
        if (view instanceof MarkdownView) {

            const editor = view.sourceMode.cmEditor;

            let src = editor.getDoc().getValue()
            let line = editor.getCursor().line

            let contents = extract(src, line)
            if (contents !== null) {
                let outputLine = contents.end + 1
                let command = apply_template(contents.lang, contents.text, vars)
                const {exec} = require("child_process");

                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        console.log(`error: ${error.message}`);
                        writeResult(editor, error, outputLine)
                        return;
                    }
                    if (stderr) {
                        console.error(`stderr: ${stderr}`);
                        writeResult(editor, stderr, outputLine)
                        return;
                    }
                    console.log(`stdout: ${stdout}`);
                    writeResult(editor, stdout, outputLine)
                });

            }
        }
    }
}

function writeResult(editor, result: string, outputLine: number) {

    let output = `\`\`\`output
${result}    
\`\`\`
`

    editor.getDoc().replaceRange(output, {line: outputLine, ch: 0});

}

function apply_template(lang: string, command: string, vars) {
    if (lang == 'python') {
        command = `${vars.python} "${command}"`;
    }
    command = command.replace('{{vault_path}}', vars.vault_path)
    command = command.replace('{{folder}}', vars.folder)
    command = command.replace('{{file_name}}', vars.file_name)
    command = command.replace('{{file_path}}', vars.file_path)
    return command
}


class RunSnippetsSettings {
    python = 'python3 -c';
}

class RunSnippetsSettingsTab extends PluginSettingTab {
    plugin: RunSnippets;

    constructor(app: App, plugin: RunSnippets) {
        super(app, plugin);
        this.plugin = plugin;

    }

    display(): void {
        const {containerEl} = this;
        const settings = this.plugin.settings;
        containerEl.empty();

        this.containerEl.createEl("h3", {
            text: "Run Snippets Settings",
        });

        new Setting(this.containerEl)
            .setName("Python")
            .setDesc("command")
            .addText(text => text.setPlaceholder('python3 -c')
                .setValue('')
                .onChange((value) => {
                    settings.python = value;
                    this.plugin.saveData(settings);
                }));
    }

}
