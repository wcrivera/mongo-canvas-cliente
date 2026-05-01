// src/pages/test/TestEditor.tsx
import "ckeditor5/ckeditor5.css";
import MathTextEditor from "../../components/CKEditor/MathTextEditor";

const TestEditor = () => {
  return (
    <div style={{ padding: 24 }}>
      <MathTextEditor
        siglaCurso="TEST"
        onChange={(data) => console.log("Editor content:", data.substring(0, 100))}
      />
    </div>
  );
};

export default TestEditor;