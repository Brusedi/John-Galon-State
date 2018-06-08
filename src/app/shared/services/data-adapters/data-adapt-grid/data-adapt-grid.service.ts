/**
 *  Adapting base data(db)-object to use by cdk-table (factory)
 * 
 */
import { Injectable } from '@angular/core';
import { DataSource } from '@angular/cdk/table';
import { Observable } from 'rxjs/Observable';

import { Db } from '../../data-ms-eng/data-ms-eng.service';
import { DataAdaptBaseService, FieldDescribe } from '../data-adapt-base/data-adapt-base.service';
import { DataFkEngService } from '../../data-fk-eng/data-fk-eng.service';


const MODULE_NAME    = 'John Galon';
const COMPONENT_NAME = 'Cdk-table data adapter';
const log = (msg:any) => ( console.log("["+MODULE_NAME+"]"+"["+COMPONENT_NAME+"] " + msg )  );

const VAL_EMPTY_KEY = ""//"пусто" ;
const VAL_UNDEV_KEY = "-"; 
const VAL_ERROR_KEY = "="//"Ошибка"; 

const DISPLAY_MD_PROP_NAME = "DisplayColumn";
const DISPLAY_NAMES_DEF    = ["name"];

const fieldNameBung = (origName: string) =>  origName.toUpperCase() == origName ? origName.toLowerCase() : origName[0].toLowerCase() + origName.substring(1);

//step check helper (huevertka)
interface ICheck<T>{ isNext:Boolean ; val:T };
const Check = <T>( inp:ICheck<T> , iif:((x:T)=>boolean ), thn:any , els:any ) => 
   inp.isNext ? ( iif(inp.val) ? ({isNext:true, val:thn}) : ({isNext:false, val:els}) ) as ICheck<any>  : inp;
const ChMap = <T>( inp:ICheck<T>, mp:((x:T) => any )) => 
   inp.isNext ?( ({isNext:true, val:mp(inp.val)}) as ICheck<any> ):inp    
const ChMergMap = <T>( inp:ICheck<T>, mp:((x:T) => Observable<any> )) =>
   inp.isNext ? ( mp(inp.val).map( x=> ({isNext:true, val:x}) as ICheck<any> ))  : Observable.of(inp);
const ChComb$ = <T>( inp:ICheck<T>, mp:((x:T) => Observable<any> ), cmbFun :((o,n) => any)   ) =>
   inp.isNext ? ( mp(inp.val).map( n => ({isNext:true, val:cmbFun(inp.val,n)}) as ICheck<any> )) : Observable.of(inp); 
   //inp.isNext ? (  Observable.of(inp.val).combineLatest(mp(inp.val), cmbFun ).map( x => ({isNext:true, val:x}) as ICheck<any> )) : Observable.of(inp); 

interface ISrce { data:any ; meta:any };

@Injectable()
export class DataAdaptGridService {

  constructor(
    private adapter:DataAdaptBaseService,
    private fkEngin:DataFkEngService
  ) { }


  /**
   * Cut parameter part of URI
   */
  private prepareLoction = (loc:string) => ( loc.indexOf('?') > 0 ? loc.substring(0,loc.indexOf('?')) : loc); 

  /**
   * Change fk code by values
   * @param dsc Metadata Describe of field
   * @param row data row
   * 
   * cols alredy filtered
   */
  private fillRowFkValues(dsc:FieldDescribe, row:any ){
    const isNotEmpty = ( x => !( x == null || x == undefined || (typeof x =='string' &&  x.trim() == "")));
    const getRefData$ =( x => this.fkEngin.getData(this.prepareLoction(dsc.foreignKey),row[dsc.altId]) );
    const fkRefMeta$ = ( x => this.fkEngin.getMeta(this.prepareLoction(dsc.foreignKey)));
    const isNotEmptyJson = (obj) => { for(var key in obj) { if(obj.hasOwnProperty(key)) return true; } return false;};

    // select fk val from data helper functions
    const getDispKey = ( m:any) => isNotEmptyJson(m)? ( m.hasOwnProperty(DISPLAY_MD_PROP_NAME) ? fieldNameBung(m[DISPLAY_MD_PROP_NAME]):undefined): undefined ;
    const checkNamesList = (( m:any) => { const n = getDispKey(m); return n == undefined ?  DISPLAY_NAMES_DEF : [n].concat(DISPLAY_NAMES_DEF); } );
    const selectValue = (x:ISrce) => { const keys = checkNamesList(x.meta); for(var key of keys){  if(x.data.hasOwnProperty(key)) return x.data[key]; } return undefined; }  

    Observable.of( ({isNext:true,val:row[dsc.altId]}) as ICheck<any> )
      .map( x => Check(x, isNotEmpty , x.val, VAL_EMPTY_KEY ))                          // ключ не пуст
      .mergeMap( x => ChMergMap(x, getRefData$ ))                                       // получаем данные 
      .map( x => Check(x, isNotEmptyJson , x.val, VAL_ERROR_KEY ))                      // что то получили 
      .mergeMap( x => ChComb$(x, fkRefMeta$, (o,n) => ({ data:o, meta:n}) as ISrce ))   // получили метаданные стримом, объеденили c сданными , вывели $-контекст наружу и схлопнули с внешним
      .map( x=> ChMap(x, selectValue ) )                                                // ищем что нидь подходящее
      .map( x => Check(x, ( y => y != undefined), x.val, VAL_UNDEV_KEY ))               // если не нашли подставляем константу
      .map(x => x.val )                                                                 // выводим из внутреннего контекста
      //.do(x => console.log(x))
      .subscribe( x=> row[dsc.altId] = x);    
    return row;
  }

  // private fillRowFkValues$(dsc:FieldDescribe, row$:Observable<any> ){
  //   console.log(dsc);
  //   const isNotEmpty = ( x => !( x == null || x == undefined || (typeof x =='string' &&  x.trim() == "")));
  //   //const getRefData$ =( x => this.fkEngin.getData(this.prepareLoction(dsc.foreignKey),row[dsc.altId]) );
  //   const getRefData$  = (x => row$.mergeMap(y => this.fkEngin.getData(this.prepareLoction(dsc.foreignKey), y[dsc.altId]) ));
  //   const fkRefMeta$ = ( x => this.fkEngin.getMeta(this.prepareLoction(dsc.foreignKey)));
  //   const isNotEmptyJson = (obj) => { for(var key in obj) { if(obj.hasOwnProperty(key)) return true; } return false;};

  //   // select fk val from data helper functions
  //   const getDispKey = ( m:any) => isNotEmptyJson(m)? ( m.hasOwnProperty(DISPLAY_MD_PROP_NAME) ? fieldNameBung(m[DISPLAY_MD_PROP_NAME]):undefined): undefined ;
  //   const checkNamesList = (( m:any) => { const n = getDispKey(m); return n == undefined ?  DISPLAY_NAMES_DEF : [n].concat(DISPLAY_NAMES_DEF); } );
  //   const selectValue = (x:ISrce) => { const keys = checkNamesList(x.meta); for(var key of keys){  if(x.data.hasOwnProperty(key)) return x.data[key]; } return undefined; };  

  //   //return Observable.of( ({isNext:true,val:row[dsc.altId]}) as ICheck<any> )
  //   const cellVal$ = row$
  //     .map(row => ({isNext:true,val:row[dsc.altId]}) as ICheck<any>  )
  //     .map( x => Check(x, isNotEmpty , x.val, VAL_EMPTY_KEY ))                          // ключ не пуст
  //     .mergeMap( x => ChMergMap(x, getRefData$ ))                                       // получаем данные 
  //     .map( x => Check(x, isNotEmptyJson , x.val, VAL_ERROR_KEY ))                      // что то получили 
  //     .mergeMap( x => ChComb$(x, fkRefMeta$, (o,n) => ({ data:o, meta:n}) as ISrce ))   // получили метаданные стримом, объеденили c сданными , вывели $-контекст наружу и схлопнули с внешним
  //     .map( x=> ChMap(x, selectValue ) )                                                // ищем что нидь подходящее
  //     .map( x => Check(x, ( y => y != undefined), x.val, VAL_UNDEV_KEY ))               // если не нашли подставляем константу
  //     .map(x => x.val ) ;                                                               // выводим из внутреннего контекста
  //     //.do( x=> console.log(x)  );

  //   return row$
  //     .combineLatest( cellVal$, ( r,v ) => { r[dsc.altId] = v ; return r  }   );//.do( x=> console.log(x)  );       // подставляем в строку 
  // }

  private getFkValue$(dsc:FieldDescribe, primVal:any ){
    const isNotEmpty = ( x => !( x == null || x == undefined || (typeof x =='string' &&  x.trim() == "")));
    const getRefData$ =( x => this.fkEngin.getData(this.prepareLoction(dsc.foreignKey),primVal) );
    const fkRefMeta$ = ( x => this.fkEngin.getMeta(this.prepareLoction(dsc.foreignKey)));
    const isNotEmptyJson = (obj) => { for(var key in obj) { if(obj.hasOwnProperty(key)) return true; } return false;};

    // select fk val from data helper functions
    const getDispKey = ( m:any) => isNotEmptyJson(m)? ( m.hasOwnProperty(DISPLAY_MD_PROP_NAME) ? fieldNameBung(m[DISPLAY_MD_PROP_NAME]):undefined): undefined ;
    const checkNamesList = (( m:any) => { const n = getDispKey(m); return n == undefined ?  DISPLAY_NAMES_DEF : [n].concat(DISPLAY_NAMES_DEF); } );
    const selectValue = (x:ISrce) => { const keys = checkNamesList(x.meta); for(var key of keys){  if(x.data.hasOwnProperty(key)) return x.data[key]; } return undefined; }  

    return Observable.of( ({isNext:true,val:primVal}) as ICheck<any> )
      .map( x => Check(x, isNotEmpty , x.val, VAL_EMPTY_KEY ))                          // ключ не пуст
      .mergeMap( x => ChMergMap(x, getRefData$ ))                                       // получаем данные 
      .map( x => Check(x, isNotEmptyJson , x.val, VAL_ERROR_KEY ))                      // что то получили 
      .mergeMap( x => ChComb$(x, fkRefMeta$, (o,n) => ({ data:o, meta:n}) as ISrce ))   // получили метаданные стримом, объеденили c сданными , вывели $-контекст наружу и схлопнули с внешним
      .map( x=> ChMap(x, selectValue ) )                                                // ищем что нидь подходящее
      .map( x => Check(x, ( y => y != undefined), x.val, VAL_UNDEV_KEY ))               // если не нашли подставляем константу
      .map(x => x.val )      
                                                                 // выводим из внутреннего контекста
  }

  private applayFk$( table:any[],cols:FieldDescribe[] ) {
    const aplayFkToCellofRow$ = (row:any ,col:FieldDescribe) =>
      Observable.of(row)
        .map( r => Observable.of(r[col.altId]).mergeMap( x => [ ]   )    )

    const aplayFkToRow$ = (row:any , cols:FieldDescribe[] ) => 
      cols.forEach( c => aplayFkToCellofRow$(row ,c)); 

    const a$ = table.map( x => aplayFkToRow$(x,cols));

  } 



  public dbGrid( dataSourse:Db, columns:string[]=undefined ){
    const mergeToArray =<T>( d:Observable<T>[]) => Observable.from(d).mergeAll().toArray();

    const foreignKeyVal = (dsc:FieldDescribe, rw:any ) => {

        this.fkEngin.getData(this.prepareLoction(dsc.foreignKey),rw[dsc.altId] )
          .subscribe(x=>rw[dsc.altId] = x);
        return rw;
    }

    const columns$ = 
       this.adapter.toGridColumns(dataSourse.fieldsMeta$);

    // filter only need procecced (FK) columns   
    const fkColumns$ =
      columns$.map( x => x.reduce( (acc,dsc) => {
        if(dsc.foreignKey != null && dsc.foreignKey != undefined && dsc.foreignKey.length > 0) {
          acc.push(dsc);
        }
        return acc
      } ,[] as FieldDescribe[]  )  )

     const viewData$ =
       dataSourse.data$
         .combineLatest(fkColumns$, (d,c) => ({data:d,cols:c}) )  
         //.map( x => x.data.map( row => x.cols.reduce( (acc,val) => foreignKeyVal(val,row),row )))
         .map( x => x.data.map( row => x.cols.reduce( (acc,val) => this.fillRowFkValues(val,row),row )))

    // const viewData$ =
    //     dataSourse.data$
    //       .combineLatest(fkColumns$, (d,c) => ({data:d,cols:c}) )  
    //       //.map( x => x.data.map( row => x.cols.reduce( (acc,val) => foreignKeyVal(val,row),row )))
    //       //.map( x => x.data.map( row => x.cols.reduce( (acc,val) => this.fillRowFkValues$(val,row), row )))  
    //       .map( x => 
    //         x.data
    //           .map( row => Observable.of(row))     
    //           .map( row$ => x.cols.reduce( (acc,val) => this.fillRowFkValues$(val,row$), row$ )  )  // на выходе имеем row$[]
    //        )
    //       //.do( x=> console.log(x) ) 
    //       .mergeMap( x => mergeToArray(x) );
    //       //

    const viewData2$ =
    dataSourse.data$
      .combineLatest(fkColumns$, (d,c) => ({data:d,cols:c}) )  

      
      
    return new DbGrid(dataSourse, columns$, viewData$ )
  } 
  
}


/**
 *  Cdk-table datasourse node
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
     return this.viewData$; 
  } 

  disconnect(): void {
  }
}
