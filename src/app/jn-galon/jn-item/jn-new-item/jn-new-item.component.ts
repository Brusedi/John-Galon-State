import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup }                from '@angular/forms';

import { Db } from '../../../shared/services/data-ms-eng/data-ms-eng.service';
import { QuestionBase } from '../../../shared/question/question-base';
import { DataAdaptItemService } from '../../../shared/services/data-adapters/data-adapt-item/data-adapt-item.service';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';


@Component({
  selector: 'app-jn-new-item',
  templateUrl: './jn-new-item.component.html',
  styleUrls: ['./jn-new-item.component.css']
})
export class JnNewItemComponent implements OnChanges{

  @Input() private dbc:Db;
  
  form: FormGroup;
  questions$: Observable<QuestionBase<any>[]>;

  payLoad = '';

  private rowSeed$ = new BehaviorSubject({});  

  private questionsSet$: Observable<{ questions:QuestionBase<any>[] ; fields:string[]}  >;
  private subscriptions:Subscription[] = [];

  constructor(public adapter:DataAdaptItemService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if( changes["dbc"].firstChange){
      this.initDataStreams();
    }

  }

  // Stream $ Subscribes
  private initDataStreams() {

    

    // подписка на любые изменения (заменена на formChangeSubscribeTargeting. отсавил на всякий)
    const formChangeSubscribe = ( frm:FormGroup ) => 
        this.subscriptions
          .push( 
            frm.valueChanges.subscribe( x => this.rowSeed$.next( this.form.value ) ) 
          );           

    // подписка только на нужные изменения 
    const formChangeSubscribeTarget = ( frm:FormGroup, flds:string[] ) => 
      flds
        .forEach(
          i => this.subscriptions.push( 
            frm.get(i).valueChanges
            //.do( x=> console.log(x) )
            .map( x => { var r = this.form.value ; r[i] = x; return r; }  ) //  на этот момент валью группы не обновлено - вручную тыкаем значение
            //.do( x=> console.log(x) )
            .subscribe(  x => this.rowSeed$.next( x )  )
          )      
        );


    // init begin values    
    const formSetInitValues = ( frm:FormGroup, flds:string[], rowTemplate ) => 
      Object.keys(rowTemplate)
        .map(x => ({ fld:frm.get(x), val:rowTemplate[x] }) )
        .filter(x => x.fld !== null && x.val !== null )
        .forEach( x =>  x.fld.setValue(x.val) )

      // Object.keys(rowTemplate)
      //   .forEach(key =>  {
      //     if(frm.get(key)){
      //       frm.get(key).setValue(rowTemplate[key] );
      //     } 
      //   })


    // базовые стримы после адаптера
    this.questionsSet$ = this.adapter.dbItemQuestionsWithDepFields$(this.dbc, this.rowSeed$) ;

    this.questions$ = 
      this.questionsSet$
        .map( x => 
          x.questions
            .sort( y => y.order )
        )


    // отписаться не забудь...    
    //this.dbc.template$
    //  .subscribe(x =>   );    

    //this.rowSeed$  
    //  .subscribe(x=>console.log(x));



   this.subscriptions
      .push(
        this.questionsSet$
          .combineLatest( this.dbc.template$, (qs,t) => ({ questions:qs.questions, fields:qs.fields, rowTemplate:t }) )  // add row template
          .subscribe( x => {  
            this.form = this.adapter.toFormGroup( x.questions); 
            
            formChangeSubscribeTarget(this.form, x.fields); //TODO Тута засада !!! возможно мультиплексирование подписок !!!!
            formSetInitValues(this.form, x.fields, x.rowTemplate ) ;    // Устанавливаем начальные значения из темплэйта без подписки !!
            //formChangeSubscribe(this.form);
          })
      );  

  }

  onSubmit() {
    this.payLoad = JSON.stringify(this.form.value);
    //this.payLoad = this.form.value;
  }

  ngOnDestroy(){
    console.log("check unsubscr item");
    while(this.subscriptions.length > 0){
      this.subscriptions.pop().unsubscribe();
    }
  }

}
