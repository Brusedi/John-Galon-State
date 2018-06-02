import { Injectable } from '@angular/core';
import { FieldDescribe } from '../data-adapt-base/data-adapt-base.service';
import { DataMsEngService } from '../../data-ms-eng/data-ms-eng.service';

@Injectable()
export class DataAdaptForeginKeyProvService {

  constructor(private dataProv:DataMsEngService) { 
  }
  /**
   * Return foregin key expression for cell
   * @param fieldInfo 
   */
  buildCellExpFunction( fieldInfo:FieldDescribe){
    //console.log(fieldInfo.foreignKey);
    if(fieldInfo.foreignKey != null && fieldInfo.foreignKey != undefined && fieldInfo.foreignKey.length > 0 ){
        console.log(fieldInfo.foreignKey);
        return (x:any)=>"хуй"; 
    }
  }

}
