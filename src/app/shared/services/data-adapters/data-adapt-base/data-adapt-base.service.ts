import { Injectable } from '@angular/core';
import { DataAdaptHelperService, IMetadata } from '../data-adapt-helper.service';
import { Observable } from 'rxjs/Observable';
//import { DataAdaptForeginKeyProvService } from '../data-adapt-foregin-key-prov/data-adapt-foregin-key-prov.service';
import { DataSource } from '@angular/cdk/table';
//import { CollectionViewer } from '@angular/cdk/collections';
//import { DataFkEngService } from '../../data-fk-eng/data-fk-eng.service';
import { Db } from '../../data-ms-eng/data-ms-eng.service';
import { ValidatorFn, Validators } from '@angular/forms';


// это похоже тип который я добавляю сям на бакэнде из рутовых метаданных
const IS_FIELD_TAG_BEGIN = "["; 
const IS_FIELD_TAG_END = "]";
const ADD_META_TYPE_KEY_NAME =  IS_FIELD_TAG_BEGIN + "Type"+IS_FIELD_TAG_END;

const RANGE_DEF_ERROR   = "Значение не попадает в допустимый диапазон";
const REQUERD_DEF_ERROR = "Значение обязательно для ввода";
const PATERN_DEF_ERROR  = "Не верный формат";

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
  validators?: ValidatorFn[]
  validationMessages? : { [key: string]: string }  
  order?:number
}


@Injectable()
export class DataAdaptBaseService {

  constructor(
    private metaHelper:DataAdaptHelperService,
  ){ 
    
  }  ADD_META_TYPE_KEY_NAME

  //  PRIVATE BASIC CONVERTORS 

  /**
  *  Build simple field val validator by metadata
  */
  private buildValidators(data:IMetadata, defVal:string){
    var ret:ValidatorFn[] = [];

    return ret
      .concat( this.metaHelper.defineOrValFunc( data,
        [{atr: "Range.Minimum", fn:( x => [ Validators.min(x) ] )} ], [] )
      )
      .concat( this.metaHelper.defineOrValFunc( data,
        [{atr: "Range.Maximum", fn:( x => [ Validators.max(x) ] )} ], [] )
      )
      .concat( this.metaHelper.defineOrValFunc( data,
        [{atr: "RegularExpression.Pattern", fn:( x => [ Validators.pattern(x)  ] )} ], [] )
      )
      .concat( this.metaHelper.defineOrValFunc( data, [
          {atr: "Required", fn:( x => [ Validators.required ] )} ,
          {atr:"Required.AllowEmptyStrings", fn: (x => x ? [] : [ Validators.required ]  ) }
        ], [] )
      );
  }    
  
  /**
  *  Build simple field val validator by metadata
  *  А я ченява, жопа кучерява...
  */
  private buildvalidationMessages(data:IMetadata, defVal:string){
    var ret:{ key: string , val: string }[] = [];
    //var retAcc:{ [key: string]: string } = {};
    
    //const toKeyValObj = (  x:{key:string ; val:string; }[]  ) =>
    // x.reduce( (acc,i) => { acc[i.key] = i.val ; return acc; } , {} ) 

    //return toKeyValObj(

    return ret
      .concat( this.metaHelper.defineOrValFuncIfExistGroup( data, "Range",
        [{atr: "Range.ErrorMessage",  fn:( x => [ { key:"min" , val:x },{ key:"max" , val:x }]) } ],
        [ { key:"min", val:RANGE_DEF_ERROR },{ key:"max", val:RANGE_DEF_ERROR }], [] )
      )
      .concat( this.metaHelper.defineOrValFuncIfExistGroup( data, "Required",
         [{atr: "Required.ErrorMessage", fn:( x => [{ key:"required", val:x }]) } ],
         [{ key:"required", val:REQUERD_DEF_ERROR }], [] )
      )
      .concat( this.metaHelper.defineOrValFuncIfExistGroup( data, "RegularExpression",
        [{atr: "RegularExpression.ErrorMessage", fn:( x => [{ key:"pattern", val:x }]) } ],
        [{ key:"pattern", val:PATERN_DEF_ERROR }], [] )
      )
      .reduce( (acc,i) => { acc[i.key] = i.val ; return acc; } , {} ) 
  }    

  /**
  *  See must field is Visible 
  */
  private buildIsVisible = (data:IMetadata, defVal:string) =>
    this.metaHelper.existOrValFunc(data, [{atr:"Display.AutoGenerateField", fn: x => !x } ] , true ) ||
    this.metaHelper.existOrValFunc(data, [{atr:"Display.AutoGenerateFilter", fn: x => !x } ] , false ) ;           


  /** 
  *   Convert metadata item to FieldDescribe type
  **/
  private toFieldDescribeFunc ( data:IMetadata, defVal:string) {
    return {
        id: defVal,
        altId: this.fieldNameBung(defVal),
        foreignKey: this.metaHelper.existOrVal(data, ["ForeignKey", "ForeignKey.Name"],""),    
        //this.metaHelper.existOrVal(data, [ADD_META_TYPE_KEY_NAME],"string"),
        type: this.metaHelper.existOrValFunc(data,[
            {atr:"DataType", fn: (x => x==1 ? "DateTime" : null )},
            {atr:"DataType", fn: (x => x==2 ? "Date" : null )},
            {atr:"DataType", fn: (x => x==7 ? "Text" : null )},
            {atr:ADD_META_TYPE_KEY_NAME, fn: (x => x)} 
          ],"string"),

        name: this.metaHelper.existOrVal(data, ["DisplayName", "Display.Name"] ,defVal),
        description: this.metaHelper.existOrVal(data, ["Description", "Display.Description"] ,undefined),
        //visible : this.metaHelper.existOrVal(data, ["Editable.AllowEdit"] , true ),                         // нецелевое использование 
        visible : this.buildIsVisible(data, defVal),                
        required: this.metaHelper.existOrValFunc(data,[
            {atr:"Required", fn: (x => x)},
            {atr:"Required.AllowEmptyStrings", fn: (x => !x)} 
            ],false),  
        defaultValue: undefined,    
        length: undefined,
        validators: this.buildValidators(data, defVal),
        validationMessages: this.buildvalidationMessages(data, defVal),
        order: this.metaHelper.existOrVal(data, ["Display.Order"] , undefined )
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
   *  Convert clear columns metadata to cdk-tabel usable format  ??? почему это здеся то ли легаси толи другое
   * @param source 
   */
  public toGridColumns( source :Observable<any[]> ){
    return source
      //.do(x=> console.log(x))
      .map( x => x.map( i => this.toFieldDescribe(i,i.id) ) )
      //.do(x=> console.log(x))
      //.map( x => x.map( i => this.toBuildCellExpression(i) ))
      .map( x => x.map( i => this.toBuildExpression(i) ))
      //.do(x=> console.log(x))
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

