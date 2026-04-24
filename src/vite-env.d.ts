/// <reference types="vite/client" />

declare module "reveal.js" {
    const Reveal: unknown;
    export default Reveal;
}

declare module "reveal.js/plugin/math/math.js" {
    const RevealMath: unknown;
    export default RevealMath;
}

// declare module 'ckeditor5-custom-build' {
//     const CKEditorCustomBuild: unknown;
//     export default CKEditorCustomBuild;
// }
