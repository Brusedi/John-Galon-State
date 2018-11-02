import { Observable } from "rxjs";
import { Action } from "@ngrx/store";
import { RouterActions, ROUTER_ACTION } from "../actions/router.actions";

//export interface State 

const ITEM_SERVICE_DEFAULT_LOCATION = '/NvaSd2/JgMockTable' ;

export interface State  {
    location : Observable<string> ;
}

const initialState = {
    location: Observable.of(ITEM_SERVICE_DEFAULT_LOCATION)
}

/**
 *  Tutoral reduser
 */
 export function reducer(state:State = initialState , action: RouterActions ):State {
     switch (action.type){
         case ROUTER_ACTION.CHAHGE_LOCATION:
              return { ...state, location:action.payload }; 
         default: 
             return state; 
     }
}