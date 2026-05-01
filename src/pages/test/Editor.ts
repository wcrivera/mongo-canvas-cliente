import { ClassicEditor } from "@ckeditor/ckeditor5-editor-classic";
import { Bold } from "@ckeditor/ckeditor5-basic-styles";
import { Essentials } from "@ckeditor/ckeditor5-essentials";
import { Paragraph } from "@ckeditor/ckeditor5-paragraph";

class Editor extends ClassicEditor {
  public static override builtinPlugins = [
    Essentials,
    Paragraph,
    Bold,
  ];

  public static override defaultConfig = {
    licenseKey: "GPL",
    toolbar: {
      items: [
        "bold",
        "undo",
        "redo",
      ],
    },
    language: "es",
  };
}

export default Editor;