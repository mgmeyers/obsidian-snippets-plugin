import "./styles.scss";

var path = require('path');
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

export default class LiterateScripting extends Plugin {
    constructor(app: App, pluginManifest: PluginManifest) {
        super(app, pluginManifest);
    }

    async onload() {
        this.registerInterval(
            window.setInterval(this.injectButtons.bind(this), 1000)
        );
    }

    injectButtons() {
        this.addRunButtons();
    }

    addRunButtons() {


        function get_vars(app: App): Promise<String> {
            let active_view = app.workspace.getActiveViewOfType(MarkdownView);
            if (active_view == null) {
                throw new Error("Active view is null");
            }

            let vaultPath = app.vault.adapter.basePath;
            let folder = active_view.file.parent.path;
            let fileName = active_view.file.name

            return {
                vault_path: vaultPath,
                folder: folder,
                file_name: fileName,
                file_path: path.join(vaultPath,folder,fileName),
                python: 'python3 -c'
            }
        }

        let vars = get_vars(this.app);

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
                command = `${vars.python} "${command}"`;
            }

            command = command.replace('{{vault_path}}', vars.vault_path)
            command = command.replace('{{folder}}', vars.folder)
            command = command.replace('{{file_name}}', vars.file_name)
            command = command.replace('{{file_path}}', vars.file_path)

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
}
