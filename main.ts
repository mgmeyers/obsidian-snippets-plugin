import './styles.scss'
import {
    Plugin,
    PluginManifest,
    MarkdownView,
    App,
    Modal,
    Notice,
    PluginSettingTab,
    Setting
} from 'obsidian';

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
        this.addCopyButtons();
    }

    addCopyButtons() {

        let a = 1

        document.querySelectorAll('pre > code').forEach(function (codeBlock) {
            const pre = codeBlock.parentNode;
            let isPython = pre.classList.contains(`language-python`)
            let isShell = pre.classList.contains(`language-shell`)
            let hasButton = pre.parentNode.classList.contains('has-run-button')

            if (!(isPython || isShell) || hasButton) {
                return;
            }

            pre.parentNode.classList.add('has-run-button');
            let button = document.createElement('button');
            button.className = 'run-code-button';
            button.type = 'button';
            button.innerText = 'Run';

            let command = codeBlock.innerText
            if (isPython) {
                command = `python3 -c "${command}"`
            }

            function runCommand(command: string) {
                const {exec} = require("child_process");
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        console.log(`error: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        console.log(`stderr: ${command}`);
                        console.error(`stderr: ${stderr}`);
                        return;
                    }
                    new Notice(stdout);
                    console.log(`stdout: ${stdout}`);
                });
            }

            button.addEventListener('click', function () {
                runCommand(command)
            });

            pre.appendChild(button);
        })

    }

}
