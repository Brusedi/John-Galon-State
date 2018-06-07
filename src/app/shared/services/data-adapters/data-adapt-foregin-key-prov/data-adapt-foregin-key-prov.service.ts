import { Injectable } from '@angular/core';
import { FieldDescribe } from '../data-adapt-base/data-adapt-base.service';
import { DataMsEngService, Db } from '../../data-ms-eng/data-ms-eng.service';
import { Subject, BehaviorSubject } from 'rxjs';
import { toObservable } from '@angular/forms/src/validators';
import { Observable } from 'rxjs/Observable';
import { DataFkEngService } from '../../data-fk-eng/data-fk-eng.service';
import { DataProvService } from '../../data-prov/data-prov.service';

@Injectable()
export class DataAdaptForeginKeyProvService {

  constructor(private dataFkEng:DataFkEngService,
              private dProv:DataProvService
  ) { 
    //this.db = this.dataProv.db(this.loc$);
    //this.db.data$.subscribe(x=> console.log(x));
  }  

  /**
   * Return foregin key expression for cell
   * @param fieldInfo 
   */
  buildCellExpFunction( fieldInfo:FieldDescribe){
    //console.log(fieldInfo.foreignKey);
    var ret:any = undefined; 
    //return ret; 
    if(fieldInfo.foreignKey != null && fieldInfo.foreignKey != undefined && fieldInfo.foreignKey.length > 0 ){
        // const lc = this.prepareLoction(fieldInfo.foreignKey); 

        // return this.cacheAcc.has(lc) ?
        //   this.cacheAcc.get(lc) : {
        //     this.loc$.next(lc)

        //   }
        
        // ret = (x:any) => {
        //    this.loc$.next(
        //      this.prepareLoction(fieldInfo.foreignKey)+"/" + x
        //    )  
        //    return 'e'; 
        //  }
      
      //ret = (x:any) => {  return Observable.of(1);  } //var z ; o.subscribe(y => z=y ); return z;    Observable.of(1);

      //const ret = (x:any) =>  this.dProv.data( this.prepareLoction(fieldInfo.foreignKey) ).share();  // .multicast(new BehaviorSubject("1"));  

      //ret =  (x:any) => this.dataFkEng.getValue$(this.prepareLoction(fieldInfo.foreignKey)).do( x=> console.log(x)) ;
      const a = new BehaviorSubject<string>("");
      a.next("dd");

      ret = (x:any) => a.delay(1).takeLast(1).do( x=> console.log(x)) ;// .of("fffff").take(1).do( x=> console.log(x)) ;
      //a.complete();      

      return ret;  
        // this.dataFkEng.getValue$(this.prepareLoction(fieldInfo.foreignKey))
        // .do( x=> console.log(x) )
        // .map(x => "1") ;
        
      

     }
    return undefined; 
  }

  /**
   * 
   * @param loc  
   */
  private prepareLoction( loc:string  ){
    return loc.indexOf('?') > 0 ? loc.substring(0,loc.indexOf('?')) : loc;
  } 

}
