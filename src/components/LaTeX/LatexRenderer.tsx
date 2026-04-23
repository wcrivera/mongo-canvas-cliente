import Latex from "react-latex-next";
import "katex/dist/katex.min.css";

interface Props {
  children: string;
}

const delimiters = [
  { left: "\\(", right: "\\)", display: false }, // inline
  { left: "\\[", right: "\\]", display: true }, // bloque
];

const LatexRenderer = ({ children }: Props) => {
  return <Latex delimiters={delimiters}>{children}</Latex>;
};

export default LatexRenderer;
