// import { useState } from "react";

import "ckeditor5/ckeditor5.css";

// import { CKEditorField } from "../../components/CKEditor";
// import CKEditorMath from "../../components/CKEditor/CKEditorMath";
import MathTextEditor from "../../components/CKEditor/MathTextEditor";

function App() {
  // const [content, setContent] = useState("");

  // console.log(content);

  const handleChange = (data: string) => {
    console.log("Editor content changed:", data.substring(0, 100) + "...");
  };
  return (
    <>
      <MathTextEditor onChange={handleChange} />

      <br />
      {/* <CKEditorMath setContent={setContent} content={content} />
      <br />

      <br /> */}
    </>
  );
}

export default App;

// // import { CKEditor } from "@ckeditor/ckeditor5-react"
// // import { CKEditorField } from "../../components/CKEditor"
// // import { ClassicEditor } from "ckeditor5";

// import "ckeditor5/ckeditor5.css";

// import { CKEditor } from '@ckeditor/ckeditor5-react';
// import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// const TestEditor = () => {
//   return (
//     <div>
//       <h2>Test Editor</h2>
//       {/* <CKEditorField
//         initialContent="<p>Hola <strong>mundo</strong>! Esto es un <em>test</em>.</p>"
//         onChange={(data) => console.log("Contenido del editor:", data)}
//       /> */}
//       {/* <CKEditor
//         editor={ClassicEditor}
//         data="<p>Hola <strong>mundo</strong>! Esto es un <em>test</em>.</p>"
//         onChange={(_event, editor) => {
//           const data = editor.getData();
//           console.log("Contenido del editor:", data);
//         }}
//       /> */}
//       <CKEditor
//         editor={ ClassicEditor }
//         data="<p>Hello from CKEditor 5!</p>"
//         onReady={ editor => {
//             console.log( 'Editor is ready to use!', editor );
//         } }
//         onChange={ ( event, editor ) => {
//             const data = editor.getData();
//             console.log( { event, editor, data } );
//         } }
//     />
//     </div>
//   )
// }

// export default TestEditor
