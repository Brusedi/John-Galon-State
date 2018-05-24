import {Component, Input} from '@angular/core';
import {DataSource} from '@angular/cdk/collections';
import {BehaviorSubject, Observable} from 'rxjs';
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/last'
import 'rxjs/add/operator/delay'
import 'rxjs/add/observable/of'

import {DataProvDsFactoryAdapterService } from '../../shared/service/data-prov-ds-adapter/data-prov-ds-factory-adapter.service';
import {IObjLocator } from '../../shared/service/data-prov/data-prov.interfaces';
import { DataProvAdapterService } from '../../shared/service/data-prov-adapter/data-prov-adapter.service';
import { IDescribe } from '../../shared/service/data-prov-adapter/data-prov-adapter.interface';


@Component({
  selector: 'app-jn-grid',
  templateUrl: './jn-grid.component.html',
  styleUrls: ['./jn-grid.component.css']
})

export class JnGridComponent  {

  @Input() svcSubUrl$: Observable<string>;
  columns$: Observable<IDescribe[]>
  displayedColumns :string[] ;
  dataSource : DataSource<any> ;
  

  constructor(
    private dataSorceFactory :DataProvDsFactoryAdapterService,
    private dataProv: DataProvAdapterService
  ) { 

  }
  private loc$= () =>  this.svcSubUrl$.map( x => ( {objName:x} as IObjLocator));

  private trans = (x:any)=> "ПИ..."

  ngOnInit() {
    this.dataSource = this.dataSorceFactory.BuildDataSource(this.loc$());  
    
    this.columns$ = 
      this.dataProv.getAsIDescribes( this.loc$() )
        .map( clmns =>                                                              // add exp for row access
            clmns.map( clmn => {
                   clmn.exp = (row:any)=>`${  clmn.cellExp!=null? clmn.cellExp(row[clmn.altId]) : row[clmn.altId] }` ; // из дескриптора поля вытаскивается фукция для представления значения
                   return  clmn;    
              }
            ) 
        );
           

    this.columns$.map(x => x.map( i => i.altId )).delay(0).subscribe(x => this.displayedColumns = x);    
     //const a = this.columns$.map(x => x.map( i => i.altId )).delay(10);
     //a.subscribe(x => this.displayedColumns = x);  

    // this.columns$.map(x => x.map( i => i.altId )).delay(0).subscribe(x => this.displayedColumns = x);


    //this.displayedColumns$ = this.columns$.map(x => x.map( i => i.altId )).delay(10000).map(x=> {console.log('delay');console.log(x);return x;});
    //this.displayedColumns$  = this.dataProv.getAsFieldsBung( this.loc$() ).delay(4000).map(x=> {console.log(x);return x;});     

    //this.displayedColumns = 
    //this.displayedColumns$.subscribe(x => this.displayedColumns = x)  
    //this.columns = this.columns$.s

    //this.displayedColumns$ = Observable.of(["id"]);
    
    //this.dataProv.getAsFieldsBung( this.loc$() ).map(x=> {console.log(x);return x;});  
    //this.displayedColumns$.subscribe( x=> console.log(x));

      // this.columns$.map(x => x.map( i => i.altId ))
      // .combineLatest( Observable.of("r") , (x,y)=> x)
       
    
    //.last((x,y,z) => true ).map(x=> {console.log(x);return x;});
     

    //this.displayedColumns$ =
    //   this.columns$.map(x => x.map( i => i.altId ))
    //   .last( () => true )
    //   ;         //displayedColumns subscribe 
    //   //.subscribe(x => this.displayedColumns = x)  ;

  }

  
   
}
