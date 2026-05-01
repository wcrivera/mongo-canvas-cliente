// RichEditor.jsx
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { ClassicEditor, Bold, Italic, FontSize, FontColor } from 'ckeditor5';
import InlineStyleSerializer from './CustomInlineStylePlugin';
import LatexPlugin from './LatexPlugin';
import 'ckeditor5/ckeditor5.css';

import React from 'react'

const MathEditor = ({ value, onChange }) => {

  return (
    <CKEditor
      editor={ClassicEditor}
      data={value}
      config={{
        plugins: [
          Bold, Italic, FontSize, FontColor,
          InlineStyleSerializer,  // <-- tus downcast converters
          LatexPlugin             // <-- soporte LaTeX nativo
        ],
        toolbar: ['bold', 'italic', 'fontSize', 'fontColor', '|', 'insertLatex'],
        fontSize: { options: [12, 14, 16, 18, 20, 24, 32] },
        fontColor: { colors: [/* tu paleta */] }
      }}
      onChange={(_, editor) => {
        // getData() usa los dataDowncast converters → HTML con inline styles
        const html = editor.getData();
        onChange(html);
      }}
    />
  );

}

export default MathEditor