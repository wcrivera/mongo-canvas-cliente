import { configureStore } from "@reduxjs/toolkit";
import type { ThunkAction, Action } from "@reduxjs/toolkit";

import { canvasCursoSlice } from "./slices/canvasCurso";
import { mongoCursoSlice } from "./slices/mongoCurso";
import { capituloMongoSlice } from "./slices/capitulo/capituloSlice";
import { claseMongoSlice } from "./slices/clase/claseSlice";
import { temaMongoSlice } from "./slices/tema/temaSlice";
import { recursoMongoSlice } from "./slices/recurso/recursoSlice";
import { diapositivaMongoSlice } from "./slices/diapositiva/diapositivaSlice";
import { videoMongoSlice } from "./slices/video/videoSlice";
import { quizMongoSlice } from "./slices/quiz/quizSlice";
import { ayudantiaMongoSlice } from "./slices/ayudantia/ayudantiaSlice";
import { solucionTextoMongoSlice } from "./slices/solucionTexto/solucionTextoSlice";
import { ejercicioMongoSlice } from "./slices/ejercicio/ejercicioSlice";
import { authSlice } from "./slices/auth/authSlice";

// import authReducer from './slices/auth/authSlice';

export const store = configureStore({
  reducer: {
    canvasCurso: canvasCursoSlice.reducer,
    mongoCurso: mongoCursoSlice.reducer,

    capituloMongo: capituloMongoSlice.reducer,
    claseMongo: claseMongoSlice.reducer,
    temaMongo: temaMongoSlice.reducer,
    recursoMongo: recursoMongoSlice.reducer,
    diapositivaMongo: diapositivaMongoSlice.reducer,
    videoMongo: videoMongoSlice.reducer,
    quizMongo: quizMongoSlice.reducer,
    ayudantiaMongo: ayudantiaMongoSlice.reducer,
    solucionTextoMongo: solucionTextoMongoSlice.reducer,
    ejercicioMongo: ejercicioMongoSlice.reducer,
    auth: authSlice.reducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
