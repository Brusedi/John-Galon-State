import { Injectable } from '@angular/core';
import { DataAdaptHelperService, IMetadata } from '../data-adapt-helper.service';
import { Observable } from 'rxjs/Observable';
//import { DataAdaptForeginKeyProvService } from '../data-adapt-foregin-key-prov/data-adapt-foregin-key-prov.service';
import { DataSource } from '@angular/cdk/table';
import { CollectionViewer } from '@angular/cdk/collections';
import { DataFkEngService } from '../../data-fk-eng/data-fk-eng.service';
import { Db } from '../../data-ms-eng/data-ms-eng.service';


/**
 *  Item (db-table-field) Metadata 
 *  field presentation descriptor
 */ 
export interface FieldDescribe {
  name: string
  description: string
  id: string
  altId: string
  foreignKey: string
  type: string
  visible: boolean
  required: boolean
  defaultValue: any
  length?: number
  cellExp?:(v:any) => any
  tag?:any
  exp?:any
}


@Injectable()
export class DataAdaptBaseService {

  constructor(
    private metaHelper:DataAdaptHelperService,
    private dataFkEng:DataFkEngService
  ){ 
    
  }  

  //  PRIVATE BASIC CONVERTORS 
  /** 
  *   Convert metadata item to FieldDescribe type
  **/
  private toFieldDescribeFunc ( data:IMetadata, defVal:string) {
    return {
        id: defVal,
        altId: this.fieldNameBung(defVal),
        foreignKey: this.metaHelper.existOrVal(data, ["ForeignKey", "ForeignKey.Name"],""),    
        type: "string",
        name: this.metaHelper.existOrVal(data, ["DisplayName", "Display.Name"] ,defVal),
        description: this.metaHelper.existOrVal(data, ["Description", "Display.Description"] ,defVal),
        visible : this.metaHelper.existOrVal(data, ["Editable.AllowEdit"] , true ),                         // нецелевое использование 
        required: this.metaHelper.existOrValFunc(data,[
            {atr:"Required", fn: (x => x)},
            {atr:"Required.AllowEmptyStrings", fn: (x => !x)} 
            ],false),  
        defaultValue: undefined,    
        length: undefined,
    } as FieldDescribe;
  }


  /** 170418 Чета я не понимаю, при выборке данных посредством entyty  
  * с регистром лэйблов происходят чудеса
  * нужна затычка до выяснения обстоятельств такого поведения. :( 
  * Преобразует оригинальное (сикульно-ентитивое) имя поля в формат приходящий с сервиса бакенда
  **/
  private fieldNameBung = (origName: string) =>  origName.toUpperCase() == origName ? origName.toLowerCase() : origName[0].toLowerCase() + origName.substring(1);

  private fieldNameBung_old(origName: string) {
    var recFun = (s: string, r: string, canToLow: boolean) => {
        if (s.length > 0) {
            var c = s[0];
            var lw = (c.toUpperCase() == c);
            r += (lw && canToLow) ? c.toLowerCase() : c;
            r = recFun(s.substring(1), r, lw )
        }
        return r;
    }
    return recFun(origName, "", true )
  }

 

  /**
   * Resolve Fk in data-stream func
   * @param sData$ 
   */
  private resolveFk(descr: Observable<FieldDescribe[]>){
    
    //const prepareLoction = ( loc:string  )=> loc.indexOf('?') > 0 ? loc.substring(0,loc.indexOf('?')) : loc;
    
    // меняет для колонки строки
    const foreignKeyVal = (dsc:FieldDescribe, rw:any ) => {
      if(dsc.foreignKey != null && dsc.foreignKey != undefined && dsc.foreignKey.length > 0){
        rw[dsc.altId] = "1"+rw[dsc.altId];
      }  
      return rw;
    }

    // меняет для строки
    const resolveRow = (row:any)=>{
      return descr.map(x => x.reduce( (acc,val) => foreignKeyVal(val,row ),row    )   )
    }

    const resolveStream =(sData$:Observable<any[]> )=> {
      return sData$.map( x=> x.map(r => resolveRow(r))  )
        .mergeMap(x=> this.mergeToArray(x))
    }

    return resolveStream ;
  }

  private mergeToArray<T>( d:Observable<T>[]  ){
    return  Observable.from(d)
    .mergeAll()
    .toArray()
  }

  // PUBLIC CONVERTORS

  /**
   *  Convert metadata item to FieldDescribe type (public)
   */ 
  public toFieldDescribe(
    source:any, 
    tag:any = undefined,
    toDefault:( (src:any,tg:any )=> any ) = ((x,y) => y ) 
  ){
    const d = source as IMetadata;
    //console.log(d);
    return d==undefined ? {} as FieldDescribe :  this.toFieldDescribeFunc(d, toDefault(d,tag)  )  
  }

  /**
   * Build template expression for FieldDescribe
   * @param source 
   */
  // public toBuildCellExpression(source:FieldDescribe){
  //   source.cellExp = this.foreginProv.buildCellExpFunction(source);
  //   return source;
  // } 

   /**
   * Build template expression for FieldDescribe
   * @param source 
   */
  public toBuildExpression(source:FieldDescribe){
    
    source.exp = (row:any)=>
         `${ source.cellExp != null ? 
             source.cellExp( row[source.altId] ) :    // из дескриптора поля вытаскивается фукция для представления значения
             row[source.altId] }`; 

    // source.exp = (row:any)=> source.cellExp != null ? 
    //       source.cellExp( row[source.altId] ):
    //       Observable.of(row[source.altId]).delay(1);

    return source;
  } 
  /**
   *  ? Convert string name to Json format see 'fieldNameBung'
   */
  public nameBung = this.fieldNameBung;
  
  // STREAM CONVERTORS

  /**
   *  Convert clear columns metadata to cdk-tabel usable format
   * @param source 
   */
  public toGridColumns( source :Observable<any[]> ){
    return source
      .map( x => x.map( i => this.toFieldDescribe(i,i.id) ) )
      //.map( x => x.map( i => this.toBuildCellExpression(i) ))
      .map( x => x.map( i => this.toBuildExpression(i) ))
      ;
  }

  /**
   * Resolve source FK 
   * @param source wrapable-DataSource 
   */
  public applayFkWrapper( source:Db, descr: Observable<FieldDescribe[]>){
    return new DataSourceWrapper(source, this.resolveFk(descr) )       
  }



}    

/**
 *  Wrap engine datasource and substitute FK- value
 * 
 */
export class DataSourceWrapper extends DataSource<any>{

  constructor(private source:Db, 
    private transform : ((src:Observable<any[]>) => Observable<any[]>)
    ){ 
    super();
  }

  connect(): Observable<any[]> {
    return  this.source.connect()    ;
    //this.transform(

  }

  disconnect(): void {
    return this.source.disconnect();
  }

}    

