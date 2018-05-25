import { Injectable } from '@angular/core';

export interface IMetadata{
  [propertyName: string]: any; 
}

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
          if (v) {
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
          if (v) {
              ret = v;
              break;
          }
      }
      return ret;
  }

  // new
  existOrVal  = (source: IMetadata, keys: string[], defVal: any) => this.ifNull( this.firstValueOf(source, keys), defVal  );
  defineOrVal = (source: IMetadata, keys: string[], defVal: any) => this.ifNullOrUndef( this.firstValueOf(source, keys), defVal );  

  existOrValFunc  = (source: IMetadata, keysAcc: { atr:string, fn:( (src: any) => any)}[], defVal: any) => this.ifNull( this.firstValueOfFunc(source, keysAcc), defVal  );
  defineOrValFunc = (source: IMetadata, keysAcc: { atr:string, fn:( (src: any) => any)}[], defVal: any) => this.ifNullOrUndef( this.firstValueOfFunc(source, keysAcc), defVal );  

}
