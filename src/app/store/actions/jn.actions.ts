import { Action } from "@ngrx/store";



export namespace JN_ACTION {
   export const JN_CHAHGE_SOURCE        = 'JN_CHAHGE_SOURCE';
   export const JN_ADD_ITEM             = 'JN_ADD_ITEM';
   export const JN_ADD_ITEM_SUCCESS     = 'JN_ADD_ITEM_SUCCESS';
   export const JN_ERROR                = 'JN_ERROR';
}

export class JnChangeSource implements Action {
   readonly type = JN_ACTION.JN_CHAHGE_SOURCE;
   constructor( public payload : string ) { console.log(payload);   } 
}

export class JnAddItem implements Action {
    readonly type = JN_ACTION.JN_ADD_ITEM;
    constructor( public payload:{ location: string, data:{}  } ) {   } 
}

export class JnAddItemSuccess implements Action {
    readonly type = JN_ACTION.JN_ADD_ITEM_SUCCESS;
    constructor( public payload: any ) {   } 
}

export class JnError implements Action {
    readonly type = JN_ACTION.JN_ERROR;
    constructor( public payload:any  ) {   } 
}


export type JnActions =
  | JnChangeSource
  | JnAddItem
  | JnAddItemSuccess
  | JnError
  ;