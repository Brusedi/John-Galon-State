import { Injectable } from '@angular/core';
import { DataSource } from '@angular/cdk/table';
import { Db } from '../../data-ms-eng/data-ms-eng.service';
import { DataAdaptBaseService, FieldDescribe } from '../data-adapt-base/data-adapt-base.service';
import { Observable } from 'rxjs/Observable';
import { DataFkEngService } from '../../data-fk-eng/data-fk-eng.service';

@Injectable()
export class DataAdaptGridService {

  constructor(
    private adapter:DataAdaptBaseService,
    private fkEngin:DataFkEngService

  ) { }

  private prepareLoction = ( loc:string, val:any  ) => 
    ( loc.indexOf('?') > 0 ? loc.substring(0,loc.indexOf('?')) : loc) +
    "/" + val ;

    
  public dbGrid( dataSourse:Db, columns:string[]=undefined ){

    const foreignKeyVal = (dsc:FieldDescribe, rw:any ) => {
      if(dsc.foreignKey != null && dsc.foreignKey != undefined && dsc.foreignKey.length > 0){
        this.fkEngin.getValue$( this.prepareLoction(dsc.foreignKey,rw[dsc.altId]) )
          .subscribe(x=>rw[dsc.altId] = x);
        //rw[dsc.altId] =  this.fkEngin.getValue$( this.prepareLoction(dsc.foreignKey,rw[dsc.altId]) ) ;
      }  
      return rw;
    }

    const columns$ = 
       this.adapter.toGridColumns(dataSourse.fieldsMeta$);

    const viewData$ =
      dataSourse.data$
        .combineLatest(columns$, (d,c) => ({data:d,cols:c}) )  
        .map( x => x.data.map( row => x.cols.reduce( (acc,val) => foreignKeyVal(val,row),row )))
        
    return new DbGrid(dataSourse, columns$, viewData$ )
  } 
  
}


/**
 *  Datasourse node
 */
export class DbGrid extends DataSource<any>{

  constructor( 
    public db:Db,
    public columns$:Observable<FieldDescribe[]>,
    public viewData$:Observable<any[]> 
  ) {
      super();
  }

  connect(){
     //console.log("connect");
     return this.viewData$; 
   } 

  disconnect(): void {
  }
  
}
