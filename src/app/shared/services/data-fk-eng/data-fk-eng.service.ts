/**
 * Http-request cacher (foregin key value provider )
 * 050618 
 * 070618 Надо сделать его потупее, но типологически разделить лист и итем ()
 * 040718 Винигрет и селедку под шубой...
 * 
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { combineLatest, map, filter, mergeMap, publish, refCount, share } from 'rxjs/operators';
import { DataProvService } from '../data-prov/data-prov.service';

enum ReqType{ List, Item, Metadata  };
interface ICachLocator { loc:string ; rType:ReqType ; cashedData?:BehaviorSubject<any> };

const lcHsh = (l:ICachLocator) => l.loc+"_"+l.rType.toString();

const MODULE_NAME    = 'John Galon';
const COMPONENT_NAME = 'DataCacherEngine';
const log = (msg:any) => ( console.log("["+MODULE_NAME+"]"+"["+COMPONENT_NAME+"] " + msg )  );


const FK_MACRO_BEGIN = "{"; 
const FK_MACRO_END = "}";

const DISPLAY_MD_PROP_NAME = "DisplayColumn";
const KEY_MD_PROP_NAME = "Key";
const DISPLAY_NAMES_DEF   = ["name"];
const DISPLAY_KEYS_DEF    = ["id"];

const     fieldNameBung = (origName: string) =>  origName.toUpperCase() == origName ? origName.toLowerCase() : origName[0].toLowerCase() + origName.substring(1);


@Injectable()
export class DataFkEngService {
  // root stream  
  private baseLocator$  = new BehaviorSubject<ICachLocator>(undefined);  // Пока оставим
  private cacheAcc:Map<string,Observable<any>> = new Map();
  private cacheAccSource:Map<string,any> = new Map();

  constructor(private dataProv: DataProvService) {
  }

  //// LOW LEVEL  

  /**
   * Get cached or new response 
   * @param loc 
   * @param isFresh 
   */
  private getRequestStream( loc:ICachLocator, isFresh:boolean = false ,isEmitCashed:boolean = false){
    console.log(loc);
    console.log(isEmitCashed?"reemit":"not reemit");

    const locs = lcHsh(loc);
    const isNew = !this.cacheAcc.has(locs);
    if(isNew) { 
      log("Cached data of location hash:"+locs);
      this.cacheAcc.set(locs,this.buildStream(loc) ); 
    }

    if(isNew || isFresh ) {
       this.baseLocator$.next(loc);
    }   
    else if(isEmitCashed){
      console.log("reemit cashed data:" + loc.loc)
      this.baseLocator$
        .next( {loc:loc.loc, rType:loc.rType, cashedData: this.cacheAccSource.get(locs)  } as ICachLocator);
     }

    return this.cacheAcc.get(locs)
  }

  private buildStream( loc:ICachLocator ){
    const reqRoute = (l:ICachLocator ) => 
      l.rType == ReqType.Item ? this.dataProv.data(l.loc) 
        :(
          l.rType == ReqType.List ?
              this.dataProv.list(l.loc) :
              this.dataProv.data(l.loc, null, true) 
        );


    return this.baseLocator$.pipe(
      combineLatest( Observable.of(loc)),
      filter( x => x[0].loc == x[1].loc && x[0].rType == x[1].rType),
      map(x => x[0]),
      mergeMap(x => x.cashedData ? Observable.of(x.cashedData) : reqRoute(x)),  // 040718
      //mergeMap(x => reqRoute(x)),
      share()
    )
     .do(x=>this.cacheAccSource.set(lcHsh(loc),x))
    //  .do(x => console.log(x));


    // return this.baseLocator$
    //   .combineLatest( Observable.of(loc))
    //   .filter( x => x[0].loc == x[1].loc && x[0].rType == x[1].rType)
    //   .map(x => x[0])
    //   .mergeMap(x => x.cashedData ? Observable.of(x.cashedData) : reqRoute(x))
    //   .do(x=>this.cacheAccSource.set(lcHsh(loc),x))
    //   .do(x => console.log(x));
      

  }    

  private getResponse(type:ReqType, location:string, key:any, isFreshVal:boolean , isReplay:boolean = false  ){
    const prepareLocation  = (key != null && key != undefined) ? location +"/"+key : location 
    const cachLoc:ICachLocator  =  { loc:prepareLocation, rType:type  };
    return this.getRequestStream(cachLoc, isFreshVal, isReplay )
  }

  // **********************************************************************
  /**
   *  Legasy
   *  Get Macros from location  
   */ 
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


  /**
   *  Строит список ключ значение по прототипу строки для fk-location 
   */
  private builsFKStream$(location:string , rowData$:Observable<{}>){ 
      const isNotEmptyJson = (obj) => { for(var key in obj) { if(obj.hasOwnProperty(key)) return true; } return false;};

      const getDispKeyName = ( m:any) => isNotEmptyJson(m)? ( m.hasOwnProperty(DISPLAY_MD_PROP_NAME) ? fieldNameBung(m[DISPLAY_MD_PROP_NAME]):undefined): undefined ;
      const getKeyName = ( m:any) => isNotEmptyJson(m)? ( m.hasOwnProperty(KEY_MD_PROP_NAME) ? fieldNameBung(m[KEY_MD_PROP_NAME]):undefined): undefined ;
      const getKeys = (m:any) => ( { key: getKeyName(m) , disp: ( getDispKeyName(m) ||  getKeyName(m))}); 

      const pickUpKey =  ( row:{}, keyName:string, otherKeys:string[] ) =>
          row.hasOwnProperty(keyName) ?  row[keyName] : otherKeys.reduce( (acc,i) => acc?acc:(row.hasOwnProperty(i)?row[i]:undefined), undefined   )

      const toKeyVal = ( row:{}, keyName:string, dispName:string ) => ({
             key: pickUpKey(row , keyName, DISPLAY_KEYS_DEF) , 
             value: pickUpKey(row , dispName, DISPLAY_NAMES_DEF)   
          });

      const fillMacros = (row:{}, loc:string ) => 
      {
        const a =  this.getLocationMacros( loc )
             .reduce( (acc,i) =>   acc.replace(FK_MACRO_BEGIN + i + FK_MACRO_END, row[fieldNameBung(i)] )  ,  loc );

        //console.log(a);    
        return a;    
      }  
  
      const buildUndepend = (loc:string) =>{ 
           const o1 = Observable.of(loc).mergeMap(x => this.getList(x));
           return Observable.of(loc).mergeMap(x => this.getMeta(x))
                  .combineLatest(o1, (m,d) => ({ meta:m, data:d})  )
                  .map( x => ( {keys:getKeys(x.meta), data:x.data } ) ) 
                  .map( x=> x.data.map(i =>  toKeyVal(i, x.keys.key, x.keys.disp )  )  ) 
      };

      const buildDepend = (loc:string, row$:Observable<{}>) =>  {
          
           const o1 = Observable.of(loc).mergeMap(x => this.getMeta(x) ); //.do(x=> console.log(x));

           return row$
             //.do( x => console.log(x) )
             .map( x => fillMacros(x, loc ) )
             //.do( x => console.log(x) )
            .mergeMap(x => this.getListReplay(x) )
            //.do(x=> console.log(x))
            .combineLatest( o1, (d,m) => ({ meta:m, data:d})) 
            //.do(x=> console.log(x)) 
            .map( x => ( {keys:getKeys(x.meta), data:x.data } ) ) 
            .map( x=> x.data.map(i =>  toKeyVal(i, x.keys.key, x.keys.disp )  )  ) 

      };

      return ( this.getLocationMacros(location).length == 0 ?
                buildUndepend(location) :
                buildDepend(location,rowData$))
                .do(x=>console.log(x))   
                ;  
  }  
       
  //*****************************************************************************


  //// HIGH LEVEL
  /**
   * Get cached data as Json Item
   * @param location base 
   * @param key if exist
   * @param isFreshVal 
   */
  getData = (location:string, key:any = undefined ,isFreshVal:boolean = false ) => this.getResponse( ReqType.Item , location, key , isFreshVal ) ;

  /**
   * Get cached metadata 
   * @param location base 
   * @param isFreshVal 
   */
  getMeta = (location:string, isFreshVal:boolean = false ) => this.getResponse( ReqType.Metadata ,location, undefined , isFreshVal ) ;

   /**
   * Get cached data as Iterable
   * @param location base 
   * @param key if exist
   * @param isFreshVal 
   */
  getList = (location:string, key:any = undefined ,isFreshVal:boolean = false ) => this.getResponse( ReqType.List , location, key , isFreshVal ) as Observable<any[]>;

  getListReplay = (location:string, key:any = undefined ,isFreshVal:boolean = false ) => 
  {
      console.log("replay");
      return this.getResponse( ReqType.List , location, key , isFreshVal, true ) as Observable<any[]>;
  }  

  /**
  * Формирует стрим из прототипа строки список валидных вторичных значений    
  */
  getForeginList$ = this.builsFKStream$;

  /**
   * отбангованный список полей макросов
   */
  getDependOwner = (loc:string) => this.getLocationMacros(loc).map(fieldNameBung);
        

}
