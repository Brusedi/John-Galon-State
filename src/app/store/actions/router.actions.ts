import { Action } from "@ngrx/store";


export namespace ROUTER_ACTION {
    export const CHAHGE_LOCATION = 'CHAHGE_LOCATION';
}

export class ChangeLocation implements Action {
    readonly type = ROUTER_ACTION.CHAHGE_LOCATION
    constructor( public payload ) {   } 
}

export type RouterActions =
  | ChangeLocation
  ;