import { Injectable } from "@angular/core";
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from "rxjs";
import { switchMap, map, catchError } from "rxjs/operators";

import { JN_ACTION, JnAddItem, JnAddItemSuccess, JnError } from "@appStore/actions/jn.actions";
import { DataProvService } from "app/shared/services/data-prov/data-prov.service";
//
//import { switchMap } from "rxjs/operator/switchMap";

//DataProvService

@Injectable()
export class JnEffects {
  constructor(
      private actions$: Actions, 
      private provService: DataProvService
) {}

    @Effect()
    addItem$ = this.actions$.pipe(
        ofType(JN_ACTION.JN_ADD_ITEM),
        switchMap((action: JnAddItem) =>
        this.provService
          .insert(action.payload.location, action.payload.data)
           .pipe(
             map(x => new JnAddItemSuccess(x)),
             catchError(error => Observable.of(new JnError(error)))
           )
      )
    );

}