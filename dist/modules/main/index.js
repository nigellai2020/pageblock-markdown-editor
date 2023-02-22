var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define("@markdown-editor/main/index.css.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_1.Styles.Theme.ThemeVars;
    components_1.Styles.cssRule('#pnlMarkdownEditor', {
        $nest: {
            'i-panel.container': {
                width: Theme.layout.container.width,
                maxWidth: Theme.layout.container.maxWidth,
                overflow: Theme.layout.container.overflow,
                textAlign: Theme.layout.container.textAlign,
                margin: '0 auto'
            }
        }
    });
});
define("@markdown-editor/main", ["require", "exports", "@ijstech/components", "@markdown-editor/main/index.css.ts"], function (require, exports, components_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MarkdownBlock = void 0;
    const configSchema = {
        type: 'object',
        properties: {
            width: {
                type: 'string',
            },
            height: {
                type: 'string',
            },
            background: {
                type: 'string',
            }
        }
    };
    let MarkdownBlock = class MarkdownBlock extends components_2.Module {
        constructor() {
            super(...arguments);
            this.defaultEdit = true;
            this.isEditing = false;
        }
        async init() {
            super.init();
            if (!this.data) {
                await this.renderEditor();
                this.renderEmptyPnl();
            }
        }
        getConfigSchema() {
            return configSchema;
        }
        getActions() {
            const actions = [
                {
                    name: 'Edit',
                    icon: 'edit',
                    visible: () => !this.isEditing,
                    command: (builder, userInputData) => {
                        return {
                            execute: () => {
                                this.edit();
                                if (builder) {
                                    builder.classList.add('is-editing');
                                    const section = builder.closest('ide-section');
                                    section && (section.style.height = 'auto');
                                }
                            },
                            undo: () => {
                            },
                            redo: () => { }
                        };
                    },
                    userInputDataSchema: {}
                },
                {
                    name: 'Confirm',
                    icon: 'check',
                    visible: () => this.isEditing,
                    command: (builder, userInputData) => {
                        return {
                            execute: () => {
                                this.confirm();
                                if (builder) {
                                    builder.classList.remove('is-editing');
                                    const section = builder.closest('ide-section');
                                    section && (section.style.height = 'auto');
                                }
                            },
                            undo: () => {
                            },
                            redo: () => { }
                        };
                    },
                    userInputDataSchema: {}
                }
            ];
            return actions;
        }
        async onConfigSave(config) {
            this.tag = config;
            this.updateMarkdown(config);
        }
        updateMarkdown(config) {
            if (!config)
                return;
            const { width, height, background } = config;
            if (this.pnlMarkdownEditor) {
                this.pnlMarkdownEditor.background.color = background;
            }
            if (this.mdEditor) {
                if (width)
                    this.mdEditor.width = width;
                if (height)
                    this.mdEditor.height = height;
            }
            if (this.mdViewer) {
                if (width)
                    this.mdViewer.width = width;
                // Using style because mode view doesnt have height attribute
                if (height)
                    this.mdViewer.style.height = height;
            }
        }
        getData() {
            return {
                content: this.data
            };
        }
        renderEmptyPnl() {
            this.pnlViewer.clearInnerHTML();
            if (this.pnlViewer.visible)
                this.pnlViewer.appendChild(this.$render("i-label", { caption: "Click to edit text", opacity: 0.5, display: "block", padding: { top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' } }));
        }
        async setData(value) {
            this.data = value.content || '';
            this.setTag({ width: value.width, height: value.height });
            this.pnlEditor.visible = this.isEditing;
            this.pnlViewer.visible = !this.isEditing;
            if (!this.data) {
                this.renderEmptyPnl();
                return;
            }
            ;
            const { width, height } = this.tag || {};
            if (!this.mdViewer) {
                this.mdViewer = await components_2.MarkdownEditor.create({
                    viewer: true,
                    value: this.data,
                    width,
                    height
                });
                this.mdViewer.display = 'block';
                if (height)
                    this.mdViewer.style.height = height;
                this.pnlViewer.clearInnerHTML();
                this.pnlViewer.appendChild(this.mdViewer);
            }
            else {
                this.pnlViewer.clearInnerHTML();
                this.pnlViewer.appendChild(this.mdViewer);
                this.mdViewer.value = this.data;
            }
        }
        getTag() {
            return this.tag;
        }
        async setTag(value) {
            this.tag = value;
            this.updateMarkdown(value);
        }
        async edit() {
            // this.pnlEditor.visible = true;
            // this.pnlViewer.visible = false;
            this.isEditing = true;
            this.renderEditor();
        }
        async confirm() {
            var _a;
            // this.pnlEditor.visible = false;
            // this.pnlViewer.visible = true;
            this.isEditing = false;
            await this.setData({
                content: ((_a = this.mdEditor) === null || _a === void 0 ? void 0 : _a.getMarkdownValue()) || ''
            });
            const builder = this.parent.closest('ide-toolbar');
            builder && builder.setData({ content: this.data });
        }
        async discard() {
            // this.pnlEditor.visible = false;
            // this.pnlViewer.visible = true;
            this.isEditing = false;
            await this.setData({
                content: this.data
            });
            const builder = this.parent.closest('ide-toolbar');
            builder && builder.setData({ content: this.data });
        }
        validate() {
            if (this.mdEditor && this.mdEditor.getMarkdownValue()) {
                return true;
            }
            return false;
        }
        async renderEditor() {
            const { width, height } = this.tag || {};
            if (!this.mdEditor) {
                this.mdEditor = await components_2.MarkdownEditor.create({
                    value: this.data,
                    mode: 'wysiwyg',
                    width,
                    height
                });
                this.mdEditor.display = 'block';
                this.pnlEditor.clearInnerHTML();
                this.pnlEditor.appendChild(this.mdEditor);
            }
            else {
                this.mdEditor.value = this.data;
            }
            this.pnlEditor.visible = this.isEditing;
            this.pnlViewer.visible = !this.isEditing;
        }
        render() {
            return (this.$render("i-panel", { id: "pnlMarkdownEditor" },
                this.$render("i-panel", { id: 'pnlEditor', padding: { top: 15, bottom: 15, left: 30, right: 30 } }),
                this.$render("i-panel", { id: 'pnlViewer', minHeight: 20 })));
        }
    };
    MarkdownBlock = __decorate([
        components_2.customModule
    ], MarkdownBlock);
    exports.MarkdownBlock = MarkdownBlock;
});
