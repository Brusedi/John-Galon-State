import { Observable, Subject } from "rxjs";
import { JN_ACTION, JnActions } from "../actions/jn.actions";


const ITEM_SERVICE_DEFAULT_LOCATION = ''; //'/NvaSd2/JgMockTable' ;

export interface State  {
    location : string ;
    //location : Observable<string>;
    loaded:    boolean;
    loading:   boolean;
    error:     any;
}

const initialState = {
    //location: Subject.create(ITEM_SERVICE_DEFAULT_LOCATION)
    location: ITEM_SERVICE_DEFAULT_LOCATION ,
    loaded:    false,
    loading:   true,
    error:     null 
}




/**
 *  Tutoral reduser
 */
 export function reducer(state:State = initialState , action: JnActions ):State {
    console.log(action);
     switch (action.type){
        case JN_ACTION.JN_CHAHGE_SOURCE:
              console.log(action.type) ; 
              return { ...state, location:action.payload}; 

        case JN_ACTION.JN_ADD_ITEM:
              console.log(action.type) ; 
              return { ...state, loading:true, loaded:false }; 

        case JN_ACTION.JN_ADD_ITEM_SUCCESS:
              console.log(action.type) ; 
              return { ...state, loading:false, loaded:true  }; 

        case JN_ACTION.JN_ERROR:
              console.log(action.type) ; 
              return { ...state, loading:false, loaded:false, error : action.payload }; 


         default: 
             return state; 
     }
}