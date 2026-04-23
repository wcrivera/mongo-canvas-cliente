import type { CursoState } from "../../store/slices/curso";

type Curso = {
  curso: CursoState;
  handleCursoClick: (course_code: string) => void;
};

const CursoCard = ({ curso, handleCursoClick }: Curso) => {
  return (
    <li
      key={curso.id}
      className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white shadow-sm dark:divide-white/10 dark:bg-gray-800/50 dark:shadow-none dark:outline dark:-outline-offset-1 dark:outline-white/10"
    >
      <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow-sm dark:divide-white/10 dark:bg-gray-800/50 dark:shadow-none dark:outline dark:-outline-offset-1 dark:outline-white/10">
        <div className="px-4 py-5 sm:px-6">
          {/* Content goes here */}
          Curso
        </div>

        <div className="px-4 py-5 sm:p-6">
          <p>{curso.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {curso.course_code}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{curso.id}</p>
        </div>
        <div className="px-4 py-4 sm:px-6">
          {/* Content goes here */}
          <button
            type="button"
            className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20"
            onClick={() => handleCursoClick(curso.course_code)}
          >
            Ingresar
          </button>
        </div>
      </div>
    </li>
  );
};

export default CursoCard;
