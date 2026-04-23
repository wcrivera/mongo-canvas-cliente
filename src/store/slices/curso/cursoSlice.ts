import { createSlice } from "@reduxjs/toolkit";

export interface CursoState {
  account_id: number;
  apply_assignment_group_weights: boolean;
  blueprint: boolean;
  calendar: {
    ics: string;
  };
  course_code: string;
  course_color: string | null;
  created_at: string;
  default_view: string;
  end_at: string | null;
  enrollment_term_id: number;
  enrollments: Array<{
    enrollment_state: string;
    limit_privileges_to_course_section: boolean;
    role: string;
    role_id: number;
    type: string;
    user_id: number;
  }>;
  friendly_name: string | null;
  grade_passback_setting: string | null;
  grading_standard_id: number | null;
  hide_final_grades: boolean;
  homeroom_course: boolean;
  id: number;
  is_public: boolean;
  is_public_to_auth_users: boolean;
  license: string;
  name: string;
  overridden_course_visibility: string;
  public_syllabus: boolean;
  public_syllabus_to_auth: boolean;
  restrict_enrollments_to_course_dates: boolean;
  root_account_id: number;
  start_at: string | null;
  storage_quota_mb: number;
  template: boolean;
  time_zone: string;
  uuid: string;
  workflow_state: string;
}

export interface CursosState {
  cursos: Array<CursoState>;
  curso: CursoState;
  isLoading: boolean;
}

const initialState: CursosState = {
  cursos: [
    {
      account_id: 0,
      apply_assignment_group_weights: false,
      blueprint: false,
      calendar: {
        ics: "",
      },
      course_code: "",
      course_color: null,
      created_at: "",
      default_view: "",
      end_at: null,
      enrollment_term_id: 0,
      enrollments: [
        {
          enrollment_state: "",
          limit_privileges_to_course_section: false,
          role: "",
          role_id: 0,
          type: "",
          user_id: 0,
        },
      ],
      friendly_name: null,
      grade_passback_setting: null,
      grading_standard_id: null,
      hide_final_grades: false,
      homeroom_course: false,
      id: 0,
      is_public: false,
      is_public_to_auth_users: false,
      license: "",
      name: "",
      overridden_course_visibility: "",
      public_syllabus: false,
      public_syllabus_to_auth: false,
      restrict_enrollments_to_course_dates: false,
      root_account_id: 0,
      start_at: null,
      storage_quota_mb: 0,
      template: false,
      time_zone: "",
      uuid: "",
      workflow_state: "",
    },
  ],
  curso: {
    account_id: 0,
    apply_assignment_group_weights: false,
    blueprint: false,
    calendar: {
      ics: "",
    },
    course_code: "",
    course_color: null,
    created_at: "",
    default_view: "",
    end_at: null,
    enrollment_term_id: 0,
    enrollments: [
      {
        enrollment_state: "",
        limit_privileges_to_course_section: false,
        role: "",
        role_id: 0,
        type: "",
        user_id: 0,
      },
    ],
    friendly_name: null,
    grade_passback_setting: null,
    grading_standard_id: null,
    hide_final_grades: false,
    homeroom_course: false,
    id: 0,
    is_public: false,
    is_public_to_auth_users: false,
    license: "",
    name: "",
    overridden_course_visibility: "",
    public_syllabus: false,
    public_syllabus_to_auth: false,
    restrict_enrollments_to_course_dates: false,
    root_account_id: 0,
    start_at: null,
    storage_quota_mb: 0,
    template: false,
    time_zone: "",
    uuid: "",
    workflow_state: "",
  },
  isLoading: true,
};

export const cursoSlice = createSlice({
  name: "cursos",
  initialState,
  reducers: {
    setCursos: (state, action) => {
      state.cursos = action.payload;
    },
    setCurso: (state, action) => {
      state.curso = action.payload;
    },
    startLoadingCurso: (state) => {
      state.isLoading = true;
    },
    endLoadingCurso: (state) => {
      state.isLoading = false;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setCursos, setCurso, startLoadingCurso, endLoadingCurso } =
  cursoSlice.actions;
