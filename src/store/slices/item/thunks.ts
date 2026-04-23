import { fetchCanvas, fetchSinToken } from "../../../helpers/fetch";
import type { AppDispatch, RootState } from "../..";

import { endLoadingItem, setItem, setItems } from "./itemSlice";

export const obtenerItemsCapitulo = ({
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

        dispatch(setItems(items));
        dispatch(endLoadingItem());
        const payload: { ok: boolean; msg: string } = {
          ok: true,
          msg: body.msg,
        };
        return payload;
      } else {
        dispatch(endLoadingItem());
        const payload: { ok: boolean; msg: string } = {
          ok: false,
          msg: body.msg,
        };
        return payload;
      }
    } catch (error) {
      console.log(error);
      dispatch(endLoadingItem());
      const payload: { ok: boolean; msg: string } = {
        ok: false,
        msg: "Estamos teniendo problemas, vuelva a intentarlo más tarde",
      };
      return payload;
    }
  };
};

export const obtenerItem = ({ curso_id }: { curso_id: string }) => {
  return async (dispatch: AppDispatch) => {
    try {
      const resp = await fetchCanvas(`curso/item/obtener/${curso_id}`);
      const body = await resp.json();

      if (body.ok) {
        const { item } = body;
        dispatch(setItem(item));
        dispatch(endLoadingItem());
        const payload: { ok: boolean; msg: string } = {
          ok: true,
          msg: body.msg,
        };
        return payload;
      } else {
        dispatch(endLoadingItem());
        const payload: { ok: boolean; msg: string } = {
          ok: false,
          msg: body.msg,
        };
        return payload;
      }
    } catch (error) {
      console.log(error);
      dispatch(endLoadingItem());
      const payload: { ok: boolean; msg: string } = {
        ok: false,
        msg: "Estamos teniendo problemas, vuelva a intentarlo más tarde",
      };
      return payload;
    }
  };
};

export const crearItem = ({
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
    content_id?: number | null;
  };
}) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const { items } = getState().item;
    try {
      const resp = await fetchSinToken(
        `item/crear/${curso_id}/${module_id}`,
        { module_item: module_item },
        "POST",
      );
      const body = await resp.json();

      if (body.ok) {
        const { item: newItem } = body;

        const newItems = [...items, newItem]
          .map((item) => {
            if (item.position < newItem.position || item.id === newItem.id) {
              return item;
            }
            return { ...item, position: item.position + 1 };
          })
          .sort((a, b) => a.position - b.position);
        dispatch(setItems(newItems));
        dispatch(endLoadingItem());
        const payload: { ok: boolean; msg: string } = {
          ok: true,
          msg: body.msg,
        };
        return payload;
      } else {
        dispatch(endLoadingItem());
        const payload: { ok: boolean; msg: string } = {
          ok: false,
          msg: body.msg,
        };
        return payload;
      }
    } catch (error) {
      console.log(error);
      dispatch(endLoadingItem());
      const payload: { ok: boolean; msg: string } = {
        ok: false,
        msg: "Estamos teniendo problemas, vuelva a intentarlo más tarde",
      };
      return payload;
    }
  };
};
