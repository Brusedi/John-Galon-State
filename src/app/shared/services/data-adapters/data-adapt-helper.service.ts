import { Injectable } from '@angular/core';

export interface IMetadata{
  [propertyName: string]: any; 
}

const METADATA_GROUP_DEVIDER : string  = "." 


/**
 *  Simple helper for parse atributes-based metadata 
 */
@Injectable()
export class DataAdaptHelperService {

  constructor() { }

  ifNullOrUndef(val: any, valDef: any) {
    return (val === null || val === undefined) ?valDef: val;
  }
  
  valueOf(source: IMetadata, key: string): any {
      return source[key];
  } 

  firstValueOf(source: IMetadata, keys: string[]): any {
      var ret: any = null;

      for (var s in keys) {
          var v = this.valueOf(source, keys[s]);
          if (v != undefined) {                                                                     // 091018 if (v)                        
              ret = v;
              break;
          }
      }
      return ret;
  } 

  ifNull(val: any, valDef: any) {
      return (val === null) ? valDef : val;
  }

  valueOfFunc(source: IMetadata, keyAcc: { atr:string, fn:( (src: any) => any)} ) {
      const v = this.valueOf(source, keyAcc.atr);
      return (v == undefined || v == null ) ? v: keyAcc.fn( this.valueOf(source, keyAcc.atr));
  }

  firstValueOfFunc(source: IMetadata, keysAcc: { atr:string, fn:( (src: any) => any)}[]) {
      var ret: any = null;
      for (var s in keysAcc) {
          var v = this.valueOfFunc(source, keysAcc[s]);
          if (v != undefined ) {                                                                      // 091018 if (v) 
              ret = v;
              break;
          }
      }
      return ret;
  }

  // new
  existOrVal  = (source: IMetadata, keys: string[], defVal: any) => this.ifNull( this.firstValueOf(source, keys), defVal  );
  defineOrVal = (source: IMetadata, keys: string[], defVal: any) => this.ifNullOrUndef( this.firstValueOf(source, keys), defVal );  



  /**
   *  Принимает метаданные и массив объектов : ключ, функция. При наличии в метаданных ключа возвращает значение функции от значения метаданных...
  */
  existOrValFunc  = (source: IMetadata, keysAcc: { atr:string, fn:( (src: any) => any)}[], defVal: any) => this.ifNull( this.firstValueOfFunc(source, keysAcc), defVal  );


  /**
   *  Принимает метаданные и массив объектов : ключ, функция. При наличии в метаданных дефайнед ключа возвращает значение функции от значения метаданных...
  */
  defineOrValFunc = (source: IMetadata, keysAcc: { atr:string, fn:( (src: any) => any)}[], defVal: any) => this.ifNullOrUndef( this.firstValueOfFunc(source, keysAcc), defVal );  

  //180718
  /**
  * Detect metadata is contains keyGroup
  */ 
  existGroup =  (source: IMetadata, keyGroup: string, groupDevider: string = METADATA_GROUP_DEVIDER ) => 
    Object.keys(source)
      .filter( x => x.includes(groupDevider) )
      .map( x => x.substring(0, x.indexOf(groupDevider)))
      .some( x => x === keyGroup );
   
  /**
  *  Проверяет наличие в метаданных группы keyGroup и если таковая есть проверяет наличие defined значения ключа метаданных keysAcc.atr 
  *  при наличии первого попавшегося возвращает результат соотв. функции  keysAcc.fn  если ни один keysAcc.atr не найден то defVal. 
  *  А если нету группы то noGroupVal
  */
  defineOrValFuncIfExistGroup = (source: IMetadata, keyGroup: string, keysAcc: { atr:string, fn:( (src: any) => any)}[], defVal: any, noGroupVal: any ) =>     
    this.existGroup( source, keyGroup ) ? this.defineOrValFunc(source, keysAcc, defVal) : noGroupVal ;

    
}
