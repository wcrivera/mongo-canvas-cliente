import { fetchSinToken } from "../../../helpers/fetch";
import type { AppDispatch } from "../..";
import type { ItemState } from "../item";
import { endLoadingActividad, setActividades } from "./actividadSlice";
// import { obtenerClasesCapitulo } from "../clase";

// import { endLoadingActividad, setActividad, setActividades } from "./actividadSlice";

export const obtenerActividadesCapitulo = ({
  curso_id,
  module_id,
}: {
  curso_id: number;
  module_id: number;
}) => {
  return async (dispatch: AppDispatch) => {
    try {
      const resp = await fetchSinToken(`item/obtener/${curso_id}/${module_id}`);
      const body = await resp.json();

      if (body.ok) {
        const { items } = body;

        const actividades = items.filter(
          (item: ItemState) =>
            item.type === "SubHeader" &&
            item.indent === 1 &&
            item.title.startsWith(`Actividad`),
        );
        dispatch(setActividades(actividades));
        dispatch(endLoadingActividad());

        // const categoria_clase: ItemState = items.find(
        //   (item: ItemState) =>
        //     item.type === "Page" &&
        //     item.indent === 0 &&
        //     item.title.includes("Clases"),
        // );

        // const categoria_ayudantia: ItemState = items.find(
        //   (item: ItemState) =>
        //     item.type === "Page" &&
        //     item.indent === 0 &&
        //     item.title.includes("Ayudantías"),
        // );

        // const categoria_ejercicio: ItemState = items.find(
        //   (item: ItemState) =>
        //     item.type === "Page" &&
        //     item.indent === 0 &&
        //     item.title.includes("Ejercicios"),
        // );

        // if (!categoria_clase) {
        //   const payload: { ok: boolean; msg: string } = {
        //     ok: true,
        //     msg: body.msg,
        //   };
        //   return payload;
        // }

        // if (!categoria_ayudantia && !categoria_ejercicio) {
        //   const actividades = items.filter(
        //     (item: ItemState) =>
        //       item.type === "SubHeader" &&
        //       item.indent === 2 &&
        //       item.position > categoria_clase.position,
        //   );
        //   dispatch(setActividades(actividades));
        //   dispatch(endLoadingActividad());
        //   const payload: { ok: boolean; msg: string } = {
        //     ok: true,
        //     msg: body.msg,
        //   };
        //   return payload;
        // }

        // if (!categoria_ejercicio) {
        //   const actividades = items.filter(
        //     (item: ItemState) =>
        //       item.type === "SubHeader" &&
        //       item.indent === 2 &&
        //       item.position > categoria_clase.position &&
        //       item.position < categoria_ayudantia.position,
        //   );
        //   dispatch(setActividades(actividades));
        //   dispatch(endLoadingActividad());
        //   const payload: { ok: boolean; msg: string } = {
        //     ok: true,
        //     msg: body.msg,
        //   };
        //   return payload;
        // }

        // if (!categoria_ayudantia) {
        //   const actividades = items.filter(
        //     (item: ItemState) =>
        //       item.type === "SubHeader" &&
        //       item.indent === 2 &&
        //       item.position > categoria_clase.position &&
        //       item.position < categoria_ejercicio.position,
        //   );
        //   dispatch(setActividades(actividades));
        //   dispatch(endLoadingActividad());
        //   const payload: { ok: boolean; msg: string } = {
        //     ok: true,
        //     msg: body.msg,
        //   };
        //   return payload;
        // }
      } else {
        dispatch(endLoadingActividad());
        const payload: { ok: boolean; msg: string } = {
          ok: false,
          msg: body.msg,
        };
        return payload;
      }
    } catch (error) {
      console.log(error);
      dispatch(endLoadingActividad());
      const payload: { ok: boolean; msg: string } = {
        ok: false,
        msg: "Estamos teniendo problemas, vuelva a intentarlo más tarde",
      };
      return payload;
    }
  };
};

export const crearActividad = ({
  curso_id,
  module_id,
  module_item,
}: {
  curso_id: number;
  module_id: number;
  module_item: {
    title: string;
    type: string;
    indent: number;
    position?: number;
    page_url?: string | null;
  };
}) => {
  return async (dispatch: AppDispatch) => {
    // const { actividades } = getState().actividad;
    try {
      const resp = await fetchSinToken(
        `item/crear/${curso_id}/${module_id}`,
        { module_item: module_item },
        "POST",
      );
      const body = await resp.json();

      if (body.ok) {
        // await dispatch(obtenerActividadesCapitulo({ curso_id, module_id }))
        // await dispatch(obtenerClasesCapitulo({ curso_id, module_id }))
        dispatch(endLoadingActividad());
        const payload: { ok: boolean; msg: string } = {
          ok: true,
          msg: body.msg,
        };
        return payload;
      } else {
        dispatch(endLoadingActividad());
        const payload: { ok: boolean; msg: string } = {
          ok: false,
          msg: body.msg,
        };
        return payload;
      }
    } catch (error) {
      console.log(error);
      dispatch(endLoadingActividad());
      const payload: { ok: boolean; msg: string } = {
        ok: false,
        msg: "Estamos teniendo problemas, vuelva a intentarlo más tarde",
      };
      return payload;
    }
  };
};
