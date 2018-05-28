import { Injectable } from '@angular/core';
import { DataAdaptHelperService, IMetadata } from '../data-adapt-helper.service';


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

  constructor(private metaHelper:DataAdaptHelperService ) { }

  private toFieldDescribeFunc ( data:IMetadata, defVal:string) {
    return {
        id: defVal,
        altId: this.fieldNameBung(defVal),
        foreignKey: this.metaHelper.existOrVal(data, ["ForeignKey", "ForeignKey.Name"],""),    
        type: "string",
        name: this.metaHelper.existOrVal(data, ["DisplayName", "Display.Name"] ,defVal),
        description: this.metaHelper.existOrVal(data, ["Description", "Display.Description"] ,defVal),
        visible : this.metaHelper.existOrVal(data, ["Editable.AllowEdit"] ,defVal),                         // нецелевое использование 
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
  * Преобразует оригинальное (сикульно-ентитивое) имя поля в формат приходящий с сервиса
  **/
  private fieldNameBung(origName: string) {
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
   *  
   */ 
  public toFieldDescribe(
    sourse:any, 
    tag:any = undefined,
    toDefault:( (src:any,tg:any )=> any ) = ((x,y) => x ) 
  ){
    const d = sourse as IMetadata;
    console.log(d);
    return d==undefined ? {} as FieldDescribe :  this.toFieldDescribeFunc(d, toDefault(d,tag)  )  
  }

  public nameBung = this.fieldNameBung;
  
  
}    
