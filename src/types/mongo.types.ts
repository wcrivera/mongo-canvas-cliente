// src/types/mongo.types.ts

export interface ICanvasCursoAsociado {
  canvas_id: number;
  nombre: string;
  activo: boolean;
  agregado_at: string;
}

export interface IMongoCurso {
  _id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  published_api: boolean;
  canvas_cursos: ICanvasCursoAsociado[];
  createdAt: string;
  updatedAt: string;
}

export interface ICanvasCursoDisponible {
  id: number;
  name: string;
  course_code: string;
  workflow_state: string;
  start_at: string | null;
  end_at: string | null;
}