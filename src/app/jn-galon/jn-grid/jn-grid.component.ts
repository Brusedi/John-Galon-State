import {Component, Input} from '@angular/core';
import {DataSource} from '@angular/cdk/collections';

import {BehaviorSubject, Observable} from 'rxjs';

import 'rxjs/add/operator/map'
import 'rxjs/add/operator/last'
import 'rxjs/add/operator/delay'
import 'rxjs/add/observable/of'
import { DataEngService } from '../../shared/services/data-eng/data-eng.service';
import { DataAdaptBaseService, FieldDescribe } from '../../shared/services/data-adapters/data-adapt-base/data-adapt-base.service';

//import { IDescribe } from '../../shared/service/data-prov-adapter/data-prov-adapter.interface';

@Component({
  selector: 'app-jn-grid',
  templateUrl: './jn-grid.component.html',
  styleUrls: ['./jn-grid.component.css']
})

export class JnGridComponent  {

  // connected data engine
  //@Input() dbc: DataEngService;

  columns$: Observable<FieldDescribe[]>
  displayedColumns$ :Observable<string[]> ;
  displayedColumns:string[] ;

  constructor( 
    private adapter:DataAdaptBaseService,
    private dbc: DataEngService ) { 

     // dbc.data$.subscribe(x=> console.log(x) )


  }

  private trans = (x:any)=> "ПИ..."

  ngOnInit() {

    this.columns$ = 
      this.dbc.fieldsMeta$
      .map(x =>  x.map( el => this.adapter.toFieldDescribe(el, el.id ) ) )
      .map( clmns =>                                                              // add exp for row access
                 clmns.map( clmn => {
                        clmn.exp = (row:any)=>`${  clmn.cellExp!=null? clmn.cellExp(row[clmn.altId]) : row[clmn.altId] }` ; // из дескриптора поля вытаскивается фукция для представления значения
                        return  clmn;    
                   }
                 ) 
             );
     
    this.displayedColumns$ = this.dbc.fieldsList$.map( x=> x.map( i=> this.adapter.nameBung(i) ) );      

    this.columns$
      .subscribe( x => console.log(x) );

    this.displayedColumns$.delay(1000).subscribe( x=> {console.log(x); this.displayedColumns = x});

    // this.dbc.fieldsList$.subscribe(x=>console.log(x));
    //this.columns$ = 
    // this.dbc.fieldsMeta$.subscribe(x=>console.log(x));


    //  .map( x =>  x.map( el => this.adapter.toFieldDescribe(el, el.id ) ) )
    //this.columns$.subscribe(x=> console.log(x));    

    //console.log(this.dbc );
   // this.dbc.dataSource$.subscribe( x=> this.dataSource = x);

    //this.dataSource.connect(undefined).subscribe( x=> console.log(x) );
    
    // this.columns$ = 
    //   this.dataProv.getAsIDescribes( this.loc$() )
    //     .map( clmns =>                                                              // add exp for row access
    //         clmns.map( clmn => {
    //                clmn.exp = (row:any)=>`${  clmn.cellExp!=null? clmn.cellExp(row[clmn.altId]) : row[clmn.altId] }` ; // из дескриптора поля вытаскивается фукция для представления значения
    //                return  clmn;    
    //           }
    //         ) 
    //     );
           

    // this.columns$.map(x => x.map( i => i.altId )).delay(0).subscribe(x => this.displayedColumns = x);    
    

  }

  
   
}
