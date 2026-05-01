// LatexPlugin.js
import { Plugin, ButtonView } from 'ckeditor5';
import { MathJax } from 'mathjax';

class LatexPlugin extends Plugin {
  static get pluginName() { return 'LatexPlugin'; }

  init() {
    const editor = this.editor;

    // Registrar el schema
    editor.model.schema.register('mathInline', {
      allowWhere: '$text',
      isInline: true,
      isObject: true,
      allowAttributes: ['latex']
    });

    editor.model.schema.register('mathBlock', {
      allowWhere: '$block',
      isObject: true,
      isBlock: true,
      allowAttributes: ['latex']
    });

    // Upcast: HTML → modelo
    editor.conversion.for('upcast').elementToElement({
      view: { name: 'span', attributes: { 'data-type': 'math-inline' } },
      model: (viewEl, { writer }) =>
        writer.createElement('mathInline', {
          latex: viewEl.getAttribute('data-latex')
        })
    });

    // Downcast: modelo → HTML con inline styles
    editor.conversion.for('dataDowncast').elementToElement({
      model: 'mathInline',
      view: (modelEl, { writer }) => {
        const latex = modelEl.getAttribute('latex');
        return writer.createRawElement('span', {
          style: 'display:inline-block;padding:0 4px;background:#f0f4ff;' +
                 'border-radius:4px;font-family:monospace;color:#185FA5;' +
                 'border:1px solid #c0d0f0',
          'data-type': 'math-inline',
          'data-latex': latex
        }, el => { el.innerHTML = latex; });
      }
    });

    // Downcast para mathBlock
    editor.conversion.for('dataDowncast').elementToElement({
      model: 'mathBlock',
      view: (modelEl, { writer }) => {
        const latex = modelEl.getAttribute('latex');
        return writer.createRawElement('div', {
          style: 'background:#E6F1FB;border:0.5px solid #b5d4f4;' +
                 'border-radius:8px;padding:14px 18px;text-align:center;' +
                 'font-family:monospace;color:#185FA5',
          'data-type': 'math-block',
          'data-latex': latex
        }, el => { el.innerHTML = latex; });
      }
    });
  }
}