//import { Router } from "@angular/router";
import * as fromRouter from '@ngrx/router-store';

import * as fromReducers from './redusers';

import { ActionReducerMap } from '@ngrx/store';
import { Observable } from 'rxjs';
import { JnEffects } from './effects/jn.effects';

export interface State {
  // routers tutoral code
  router : fromReducers.router.State
  routerReducer: fromRouter.RouterReducerState;
  //jn
  jn:fromReducers.jn.State;
}

export const reducers: ActionReducerMap<State> = {
  router: fromReducers.router.reducer,
  routerReducer: fromRouter.routerReducer,
  jn:fromReducers.jn.reducer
};

export const effects = [JnEffects];

// export const actions: ActionReducerMap<State> = {
//   router: fromReducers.router.reducer,
//   routerReducer: fromRouter.routerReducer,
//   jn:fromReducers.jn.reducer
// };

// export function getState$(store) {
//   return new Observable(function (observer) {
//     // emit the current state as first value:
//     observer.next(store.getState());
//     const unsubscribe = store.subscribe(function () {
//       // emit on every new state changes
//       observer.next(store.getState());
//     });
//     // let's return the function that will be called
//     // when the Observable is unsubscribed
//     return unsubscribe;
//   });
// }

