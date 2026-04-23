import { fetchCanvas, fetchSinToken } from "../../../helpers/fetch";
import type { AppDispatch, RootState } from "../..";

import { endLoadingPage, setPage, setPages, type PageState } from "./pageSlice";

export const obtenerPagesCurso = ({ curso_id }: { curso_id: number }) => {
  return async (dispatch: AppDispatch) => {
    try {
      const resp = await fetchSinToken(`page/obtener/${curso_id}`);
      const body = await resp.json();

      if (body.ok) {
        const { pages } = body;
        dispatch(setPages(pages));
        dispatch(endLoadingPage());
        const payload: { ok: boolean; msg: string; pages: Array<PageState> } = {
          ok: true,
          msg: body.msg,
          pages: pages,
        };
        return payload;
      } else {
        dispatch(endLoadingPage());
        const payload: { ok: boolean; msg: string; pages: Array<PageState> } = {
          ok: false,
          msg: body.msg,
          pages: [
            {
              page_id: 0,
              position: 0,
              title: "",
              indent: 0,
              quiz_lti: false,
              type: "",
              module_id: 0,
              html_url: "",
              page_url: "",
              publish_at: null,
              url: "",
              published: false,
              unpublishable: false,
            },
          ],
        };
        return payload;
      }
    } catch (error) {
      console.log(error);
      dispatch(endLoadingPage());
      const payload: { ok: boolean; msg: string; pages: Array<PageState> } = {
        ok: false,
        msg: "Estamos teniendo problemas, vuelva a intentarlo más tarde",
        pages: [
          {
            page_id: 0,
            position: 0,
            title: "",
            indent: 0,
            quiz_lti: false,
            type: "",
            module_id: 0,
            html_url: "",
            page_url: "",
            publish_at: null,
            url: "",
            published: false,
            unpublishable: false,
          },
        ],
      };
      return payload;
    }
  };
};

export const crearPaginaPrincipalCurso = ({
  curso_id,
  wiki_page,
}: {
  curso_id: number;
  wiki_page: {
    title: string;
    body: string;
    published: boolean;
    front_page: boolean;
  };
}) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const { pages } = getState().page;
    const { capitulos } = getState().capitulo;

    const capitulos_canvas = `${
      `
      <div style="background-color: #e5e7eb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 0px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
        <div style="padding: 10px 20px; border-bottom: 1px solid #d1d5db; border-top-left-radius: 8px 8px; border-top-right-radius: 8px 8px;">
          <h1 style="font-size: 24px; font-weight: 900; color: #374151; margin: 0;">Capítulos</h1>
        </div>
        ` +
      capitulos
        .map((modulo) => {
          const { name, position } = modulo;
          return `
              <!-- Capítulo -->
              <div style=" background-color: white; padding: 20px 20px; display: flex; gap: 40px; margin-bottom: 0px; align-items: center; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb;">
  
                <!-- Card izquierda -->
                <div style="width: 50%; background: linear-gradient(135deg, #4A6D8C 0%, #5a7d9c 100%); border-radius: 24px 30%; padding: 20px; position: relative; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <div style="display: flex; align-items: center; gap: 20px;">
                    <div style="font-size: 36px; font-weight: 700; color: white; line-height: 1;">${position}</div>
                    <h2 style="font-size: 28px; font-weight: 600; color: white; margin: 0; flex: 1;">${name.replace(
                      new RegExp(`Capítulo ${position}\\.`, "g"),
                      "",
                    )}}</h2>
                  </div>
  
                  <div style="text-align: right; margin-top: 20px;">
                    <a href="#" style="background-color: white; color: #4A6D8C; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 500; display: inline-block;">
                      Ingresar
                    </a>
                  </div>
                </div>
                <!-- Lista de temas (derecha) -->
              </div>
                  `;
        })
        .join("\n\n") +
      `
        <div style="padding: 10px 20px; text-align: center;">
          <p style="font-size: 18px; color: #6b7280; margin: 0;">
            Facultad de Matemáticas UC ❤️
          </p>
        </div>
      </div>`
    }`;
    try {
      const resp = await fetchSinToken(
        `page/crear/${curso_id}`,
        { wiki_page: { ...wiki_page, body: capitulos_canvas } },
        "POST",
      );
      const body = await resp.json();

      if (body.ok) {
        const { page } = body;
        dispatch(setPages([...pages, page]));
        dispatch(endLoadingPage());
        const payload: { ok: boolean; msg: string } = {
          ok: true,
          msg: body.msg,
        };
        return payload;
      } else {
        dispatch(endLoadingPage());
        const payload: { ok: boolean; msg: string } = {
          ok: false,
          msg: body.msg,
        };
        return payload;
      }
    } catch (error) {
      console.log(error);
      dispatch(endLoadingPage());
      const payload: { ok: boolean; msg: string } = {
        ok: false,
        msg: "Estamos teniendo problemas, vuelva a intentarlo más tarde",
      };
      return payload;
    }
  };
};

export const editarPaginaPrincipalCurso = ({
  curso_id,
  wiki_page,
  page_id,
}: {
  curso_id: number;
  wiki_page: {
    title: string;
    body: string;
    published: boolean;
    front_page: boolean;
  };
  page_id: number;
}) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const { pages } = getState().page;
    const { capitulos } = getState().capitulo;

    const capitulos_canvas = `${
      `
      <div style="background-color: #e5e7eb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 0px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
        <div style="padding: 10px 20px; border-bottom: 1px solid #d1d5db; border-top-left-radius: 8px 8px; border-top-right-radius: 8px 8px;">
          <h1 style="font-size: 24px; font-weight: 900; color: #374151; margin: 0;">Capítulos</h1>
        </div>
        ` +
      capitulos
        .map((capitulo) => {
          const { name, position } = capitulo;
          return `
              <!-- Capítulo -->
              <div style=" background-color: white; padding: 20px 20px; display: flex; gap: 40px; margin-bottom: 0px; align-items: center; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb;">
  
                <!-- Card izquierda -->
                <div style="width: 50%; background: linear-gradient(135deg, #4A6D8C 0%, #5a7d9c 100%); border-radius: 24px 30%; padding: 20px; position: relative; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <div style="display: flex; align-items: center; gap: 20px;">
                    <div style="font-size: 36px; font-weight: 700; color: white; line-height: 1;">${position}</div>
                    <h2 style="font-size: 28px; font-weight: 600; color: white; margin: 0; flex: 1;">${name.replace(
                      new RegExp(`Capítulo ${position}\\.`, "g"),
                      "",
                    )}</h2>
                  </div>
  
                  <div style="text-align: right; margin-top: 20px;">
                    <a href="/courses/${curso_id}/pages/capitulo-${capitulo.position}-clases" style="background-color: white; color: #4A6D8C; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 500; display: inline-block;">
                      Ingresar
                    </a>
                  </div>
                </div>
                
                <!-- Lista de temas (derecha) -->
              </div>
                  `;
        })
        .join("\n\n") +
      `
        <div style="padding: 10px 20px; text-align: center;">
          <p style="font-size: 18px; color: #6b7280; margin: 0;">
            Facultad de Matemáticas UC ❤️
          </p>
        </div>
      </div>`
    }`;
    try {
      const resp = await fetchSinToken(
        `page/editar/${curso_id}/${page_id}`,
        { wiki_page: { ...wiki_page, body: capitulos_canvas } },
        "PUT",
      );
      const body = await resp.json();

      if (body.ok) {
        const { page } = body;
        dispatch(
          setPages([...pages.filter((p) => p.page_id !== page.page_id), page]),
        );
        dispatch(endLoadingPage());
        const payload: { ok: boolean; msg: string } = {
          ok: true,
          msg: body.msg,
        };
        return payload;
      } else {
        dispatch(endLoadingPage());
        const payload: { ok: boolean; msg: string } = {
          ok: false,
          msg: body.msg,
        };
        return payload;
      }
    } catch (error) {
      console.log(error);
      dispatch(endLoadingPage());
      const payload: { ok: boolean; msg: string } = {
        ok: false,
        msg: "Estamos teniendo problemas, vuelva a intentarlo más tarde",
      };
      return payload;
    }
  };
};

// Obtener una página específica del curso

export const obtenerPage = ({ curso_id }: { curso_id: string }) => {
  return async (dispatch: AppDispatch) => {
    try {
      const resp = await fetchCanvas(`curso/page/obtener/${curso_id}`);
      const body = await resp.json();

      if (body.ok) {
        const { page } = body;
        dispatch(setPage(page));
        dispatch(endLoadingPage());
        const payload: { ok: boolean; msg: string } = {
          ok: true,
          msg: body.msg,
        };
        return payload;
      } else {
        dispatch(endLoadingPage());
        const payload: { ok: boolean; msg: string } = {
          ok: false,
          msg: body.msg,
        };
        return payload;
      }
    } catch (error) {
      console.log(error);
      dispatch(endLoadingPage());
      const payload: { ok: boolean; msg: string } = {
        ok: false,
        msg: "Estamos teniendo problemas, vuelva a intentarlo más tarde",
      };
      return payload;
    }
  };
};

export const crearPaginaCurso = ({
  curso_id,
  wiki_page,
}: {
  curso_id: number;
  wiki_page: {
    title: string;
    body: string;
    published: boolean;
    front_page: boolean;
  };
}) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const { pages } = getState().page;
    try {
      const resp = await fetchSinToken(
        `page/crear/${curso_id}`,
        { wiki_page: wiki_page },
        "POST",
      );
      const body = await resp.json();

      if (body.ok) {
        const { page } = body;
        dispatch(setPages([...pages, page]));
        dispatch(endLoadingPage());
        const payload: { ok: boolean; msg: string; page: PageState } = {
          ok: true,
          msg: body.msg,
          page: page,
        };
        return payload;
      } else {
        dispatch(endLoadingPage());
        const payload: { ok: boolean; msg: string, page: PageState } = {
          ok: false,
          msg: body.msg,
          page: {
            page_id: 0,
            position: 0,
            title: "",
            indent: 0,
            quiz_lti: false,
            type: "",
            module_id: 0,
            html_url: "",
            page_url: "",
            publish_at: null,
            url: "",
            published: false,
            unpublishable: false,
          },
        };
        return payload;
      }
    } catch (error) {
      console.log(error);
      dispatch(endLoadingPage());
      const payload: { ok: boolean; msg: string, page: PageState } = {
        ok: false,
        msg: "Estamos teniendo problemas, vuelva a intentarlo más tarde",
        page: {
          page_id: 0,
          position: 0,
          title: "",
          indent: 0,
          quiz_lti: false,
          type: "",
          module_id: 0,
          html_url: "",
          page_url: "",
          publish_at: null,
          url: "",
          published: false,
          unpublishable: false,
        },
      };
      return payload;
    }
  };
};

export const editarPaginaCurso = ({
  curso_id,
  page_id,
  wiki_page,
}: {
  curso_id: number;
  page_id: number;
  wiki_page: {
    title: string;
    body: string;
    published: boolean;
    front_page: boolean;
  };
}) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const { pages } = getState().page;
    try {
      const resp = await fetchSinToken(
        `page/editar/${curso_id}/${page_id}`,
        { wiki_page: wiki_page },
        "PUT",
      );
      const body = await resp.json();

      if (body.ok) {
        const { page } = body;
        dispatch(setPages([...pages.filter((p) => p.page_id !== page.page_id), page]));
        dispatch(endLoadingPage());
        const payload: { ok: boolean; msg: string, page: PageState } = {
          ok: true,
          msg: body.msg,
          page: page,
        };
        return payload;
      } else {
        dispatch(endLoadingPage());
        const payload: { ok: boolean; msg: string, page: PageState } = {
          ok: false,
          msg: body.msg,
          page: {
            page_id: 0,
            position: 0,
            title: "",
            indent: 0,
            quiz_lti: false,
            type: "",
            module_id: 0,
            html_url: "",
            page_url: "",
            publish_at: null,
            url: "",
            published: false,
            unpublishable: false,
          },
        };
        return payload;
      }
    } catch (error) {
      console.log(error);
      dispatch(endLoadingPage());
      const payload: { ok: boolean; msg: string, page: PageState } = {
        ok: false,
        msg: "Estamos teniendo problemas, vuelva a intentarlo más tarde",
        page: {
          page_id: 0,
          position: 0,
          title: "",
          indent: 0,
          quiz_lti: false,
          type: "",
          module_id: 0,
          html_url: "",
          page_url: "",
          publish_at: null,
          url: "",
          published: false,
          unpublishable: false,
        },
      };
      return payload;
    }
  };
};
