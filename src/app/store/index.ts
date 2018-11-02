//import { Router } from "@angular/router";

import * as fromReducers from './redusers';
import { ActionReducerMap } from '@ngrx/store';

export interface State {
     router : fromReducers.router.State
}


export const reducers: ActionReducerMap<State> = {
    router: fromReducers.router.reducer
  };
