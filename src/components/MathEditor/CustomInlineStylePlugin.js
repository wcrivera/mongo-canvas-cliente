// CustomInlineStylePlugin.js
import { Plugin } from '@ckeditor/ckeditor5-core';

class InlineStyleSerializer extends Plugin {
  init() {
    const editor = this.editor;
    const conversion = editor.conversion;

    // Downcast converter para bold → inline style
    conversion.for('dataDowncast').attributeToElement({
      model: 'bold',
      view: (modelValue, { writer }) => {
        return writer.createAttributeElement('span', {
          style: 'font-weight: 700'
        });
      }
    });

    // Downcast para italic
    conversion.for('dataDowncast').attributeToElement({
      model: 'italic',
      view: (modelValue, { writer }) => {
        return writer.createAttributeElement('span', {
          style: 'font-style: italic'
        });
      }
    });

    // Downcast para fontSize
    conversion.for('dataDowncast').attributeToElement({
      model: 'fontSize',
      view: (value, { writer }) => {
        return writer.createAttributeElement('span', {
          style: `font-size: ${value}`
        });
      }
    });

    // Downcast para fontColor
    conversion.for('dataDowncast').attributeToElement({
      model: 'fontColor',
      view: (value, { writer }) => {
        return writer.createAttributeElement('span', {
          style: `color: ${value}`
        });
      }
    });

    // Downcast para párrafos con alineación
    conversion.for('dataDowncast').elementToElement({
      model: 'paragraph',
      view: (modelElement, { writer }) => {
        const align = modelElement.getAttribute('alignment') || 'left';
        return writer.createContainerElement('p', {
          style: `font-family: Sora, sans-serif; font-size: 15px; text-align: ${align};`
        });
      }
    });
  }
}