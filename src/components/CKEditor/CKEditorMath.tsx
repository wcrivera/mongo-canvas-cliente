

import { CKEditor } from "@ckeditor/ckeditor5-react";
import { Bold, ButtonView, ClassicEditor, Essentials, Italic, Paragraph, Plugin } from "ckeditor5";


import "ckeditor5/ckeditor5.css";

class Timestamp extends Plugin {
    init() {
        const editor = this.editor;
        // The button must be registered among the UI components of the editor
        // to be displayed in the toolbar.
        editor.ui.componentFactory.add( 'timestamp', () => {
            // The button will be an instance of ButtonView.
            const button = new ButtonView();

            button.set( {
                label: 'Timestamp',
                withText: true
            } );

            // Execute a callback function when the button is clicked.
            button.on( 'execute', () => {
                const now = new Date();

                // Change the model using the model writer.
                editor.model.change( writer => {

                    // Insert the text at the user's current position.
                    editor.model.insertContent( writer.createText( now.toString() ) );
                } );
            } );

            return button;
        } );
    }
}


type CKEditorMathProps = {
  content: string;
  setContent: (html: string) => void;
};


const CKEditorMath = ({ content, setContent }: CKEditorMathProps) => {
  
  return (
    <CKEditor
      editor={ClassicEditor}
      config={{
        licenseKey: "GPL",
        plugins: [Essentials, Paragraph, Bold, Italic, Timestamp],
        toolbar: ["undo", "redo", "|", "bold", "italic", "|", "formatPainter"],
        root: {
          initialData: content,
        },
      }}
      onChange={(_event, editor) => {
        const data = editor.getData();
        setContent(data);
        console.log({ editor, data });
      }}
    />
  );
};

export default CKEditorMath;
