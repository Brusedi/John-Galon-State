import { Injectable } from '@angular/core';
import { Http } from '@angular/http'; 
import { AppSettingsService } from '../appsettings.service';

import 'rxjs/add/operator/map'
import 'rxjs/add/operator/mergeMap'

const MODULE_NAME    = 'John Galon';
const COMPONENT_NAME = 'DataProvider';

const FK_MACRO_BEGIN = "{";  // backend macros tags
const FK_MACRO_END = "}";

const log = (msg:any) => ( console.log("["+MODULE_NAME+"]"+"["+COMPONENT_NAME+"] " + msg )  );

@Injectable()
export class DataProvService {
  constructor(
    private http: Http,
    private settings: AppSettingsService
  ) { 
      settings.getSettings().subscribe( x =>log( "Service activated with location: "+ x.svcFasadeUri  ));
  }

  private getDataFromUri = (uri: string) =>  this.http.get(uri).map(rsp => rsp.text());

  /**
   *  Return main data as iterable by http-service sublocation
   */ 
  public list( location:string  ){ 
      return this.data(location) 
        .map(x => {
          var r = <any[]>x;
          return (r === null) ? [] : r; 
        })
    }        

  /**
   *  Return any data from http-service as JSON
   */ 
  public data( loc:string , subloc:string = undefined , isMetadata = false  ) {
    return this.buildDataUri(loc, subloc, isMetadata)
      .mergeMap( x => this.getDataFromUri( x ))
      .map(x  => x.trim()===""? {}: JSON.parse(x) );
  }

  // Uri prepare tools -----------------------------------------------
  // Build service Uri for data ... or metadate   
  private buildDataUri(loc:string , subloc:string, isMetadata = false) {
      var bldUriTail = ( fld?:string )=> (typeof fld === "string" && fld != "") ? ("/" + fld) : (""); 
      return this.settings.getSettings()
          .map(prs => this.prepareLocation( prs.svcFasadeUri, loc, isMetadata)   // MergeMap
                + (isMetadata?prs.svcRestMetadataSuffix:"")
                + bldUriTail( subloc ) 
              );
  }

  // В связи с использованием референсов на внешние сервисы необходимо парсить локатион
  private prepareLocation(baseSvcUrl:string, location: string, isCutTail: boolean = false) {
      function cutTail(l: string) {
          return l.indexOf("?") >= 0 ? l.substring(0, l.indexOf("?")) : l;
      }

      location = (isCutTail) ? cutTail(location) : location;
      var ret = "";
      if (location.startsWith("http://"))     { throw new Error("Not implement"); }
      else if (location.startsWith("../"))    { throw new Error("Not implement"); }
      else if (location.startsWith("./"))     { ret = baseSvcUrl + location.substr(1);}
      else                                    { ret = baseSvcUrl + location; }
      return ret;
  }

  // Substract macros from location
  private getLocationMacros(location: string) {
      var recFun = (s: string, r: string[]) => {
          var bp = s.indexOf(FK_MACRO_BEGIN)
          if (bp > 0 && s.length > (bp+1) ) {
              var ss = s.substring(bp+1);
              var ep = ss.indexOf(FK_MACRO_END);
              if (ep > 0) {
                  r.push(ss.substring(0, ep));
                  r = recFun(ss.substring(ep), r);
              }
          }
          return r;
      }
      return recFun(location, []);
  }
  
  // Заполняет макросы Лукашина валуями
  private buildLocationWithMacrosValues(location: string, values: any[]) {
      var mcs = this.getLocationMacros(location);
      if (mcs.length > values.length) {
          throw Error("Can't aplay values '" + values.toString() + "' on Uri '" + location+"'" )
      }
      var i = 0;
      for (let v of mcs) {
          location = location.replace(FK_MACRO_BEGIN + v + FK_MACRO_END, values[i]);
          i++;
      }
      return location;
  }

}
