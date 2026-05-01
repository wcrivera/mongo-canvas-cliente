import { Plugin, ButtonView } from 'ckeditor5';

export class TimestampPlugin extends Plugin {
  static get pluginName(): string {
    return 'TimestampPlugin';
  }

  init(): void {
    const editor = this.editor;

    editor.ui.componentFactory.add('timestamp', () => {
      const button = new ButtonView();

      button.set({
        label: 'Insert Timestamp',
        withText: true,
        tooltip: true,
        class: 'ck-timestamp-button',
      });

      button.on('execute', () => {
        // Llama al callback que pasaste desde React
        const onOpen = editor.config.get('timestamp.onOpen') as (() => void) | undefined;
        onOpen?.();
      });

      return button;
    });
  }
}