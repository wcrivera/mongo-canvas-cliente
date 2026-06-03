import { useEffect, useState, useMemo } from "react";
// redux
import { CKEditor } from "@ckeditor/ckeditor5-react";

import { InlineEditor } from "ckeditor5";
import { Button } from "@mui/material";

InlineEditor.defaultConfig = {
  toolbar: {
    items: [
      // 'heading',
      "sourceEditing",
      "|",
      "bold",
      "italic",
      // 'link',
      "bulletedList",
      "numberedList",
      "|",
      "outdent",
      "indent",
      "|",
      // 'imageUpload',
      "blockQuote",
      "insertTable",
      "mediaEmbed",
      "undo",
      "redo",
      // 'textPartLanguage',
      "alignment",
      "fontBackgroundColor",
      "fontColor",
      "fontFamily",
      "horizontalLine",
      "imageInsert",
      // 'style',
      "underline",
      "fontSize",
      "math",
    ],
  },
  language: "es",
  image: {
    toolbar: [
      "imageTextAlternative",
      "toggleImageCaption",
      "imageStyle:inline",
      "imageStyle:block",
      "imageStyle:side",
    ],
  },
  table: {
    contentToolbar: [
      "tableColumn",
      "tableRow",
      "mergeTableCells",
      "tableCellProperties",
      "tableProperties",
    ],
  },
  math: {
    engine: "katex",
    outputType: "span",
  },
  htmlSupport: {
    allow: [
      {
        name: /.*/,
        attributes: true,
        classes: true,
        styles: true,
      },
      // {
      //   name: "ol",
      //   classes: ["row"],
      // },
      // {
      //   name: "li",
      //   classes: ["col-6", "col-4", "col-3", "list-item"],
      //   attibutes: {
      //     type: true,
      //     start: true,
      //   },
      // },
      { name: "ol", attributes: { type: true }, classes: true, styles: true },
    ],
    // disallow: [],
  },
  // removePlugins: ["MediaEmbedToolbar"],
};

type Props = {
  data: string;
  setData: () => void;
  //   contenido: string
  //   setContenido: Function
};

const EditorMath = ({ data, setData }: Props) => {
  const [contenido, setContenido] = useState("");
  const [estado, setEstado] = useState(true);

  const processedContent = useMemo(() => {
    if (data) {
      let contenido: string = data;
      contenido = contenido
        .replace(
          /<span class="math-tex">((.|\r?\n)*?)<\/span>/g,
          function (match, contents, offset, input_string) {
            console.log(match, offset, input_string);
            return `${contents}`;
          },
        )
        .replace(
          /\\\(((.|\r?\n)*?)\\\)/g,
          function (match, contents, offset, input_string) {
            console.log(match, offset, input_string);
            return `<span class="math-tex">\\(${contents}\\)<\/span>`;
          },
        )
        .replace(
          /\\\[((.|\r?\n)*?)\\\]/g,
          function (match, contents, offset, input_string) {
            console.log(match, offset, input_string);
            return `<span class="math-tex">\\[${contents}\\]<\/span>`;
          },
        );
      return contenido;
    }
    return "";
  }, [data]);

  useEffect(() => {
    setContenido(processedContent);
  }, [processedContent]);

  // useEffect(() => {
  //   if (diapositivas.length >= pagina) {
  //     const diapositivasUpdate = diapositivas.map((item) => {
  //       if (item.pagina === pagina) {
  //         return {
  //           ...item,
  //           pagina: pagina,
  //           contenido: contenido
  //             .replace(
  //               /<span class="math-tex">((.|\r?\n)*?)<\/span>/g,
  //               function (match, contents, offset, input_string) {
  //                 console.log(match, offset, input_string);
  //                 return `${contents}`;
  //               }
  //             )
  //             // .replace(
  //             //   /<span type="math\/tex; mode=display">((.|\r?\n)*?)<\/span>/g,
  //             //   function (match, contents, offset, input_string) {
  //             //     return `\\[${contents}\\]`;
  //             //   }
  //             // )
  //             .replace(/&nbsp;/g, " ")
  //             .replace(/&amp;/g, "&"),
  //         };
  //       }

  //       return item;
  //     });
  //     setDiapositiva({ ...diapositiva, diapositivas: diapositivasUpdate });
  //   }
  // }, [contenido]);

  useEffect(() => {
    return () => {
      setContenido("");
    };
  }, []);

  if (diapositiva.did === "") {
    return "Cargando...";
  }

  return (
    <div className="row">
      <div className="col-12">
        <Button onClick={() => setEstado(true)} sx={{ mb: 1 }}>
          Cambiar Editor
        </Button>
        <CKEditor
          editor={Editor}
          data={contenido}
          // data={''}
          onError={(error) => {
            console.log(error);
          }}
          onReady={(editor) => {
            // editor.isReadOnly = true

            // editor.enableReadOnlyMode("feature-id");

            editor.editing.view.change((writer: any) => {
              writer.setStyle(
                //use max-height(for scroll) or min-height(static)
                "height",
                "75vh",
                editor.editing.view.document.getRoot(),
              );
            });
            editor.editing.view.change((writer: any) => {
              writer.setStyle(
                //use max-height(for scroll) or min-height(static)
                "font-size",
                "18px",
                editor.editing.view.document.getRoot(),
              );
            });
          }}
          onChange={(event, editor: any) => {
            var data = editor.getData();
            console.log(event);
            setContenido(data);
          }}
        />
      </div>
    </div>
  );
};

export default EditorMath;
