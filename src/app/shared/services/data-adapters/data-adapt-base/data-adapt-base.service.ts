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
        altId: defVal,
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

}    
