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
            .map( x => { var r = this.form.value ; r[i] = x; return r; }  ) //  на этот момент валью группы не обновлено - вручную тыкаем значение
            .subscribe(  x => this.rowSeed$.next( x )  )
          )      
        );

    // базовые стримы после адаптера
    this.questionsSet$ = this.adapter.dbItemQuestionsWithDepFields$(this.dbc, this.rowSeed$) ;

    this.questions$ = this.questionsSet$.map( x => x.questions );   
    
    this.subscriptions
      .push(
        this.questionsSet$
          .subscribe( x => {  
            this.form = this.adapter.toFormGroup( x.questions);
            formChangeSubscribeTarget(this.form, x.fields); //TODO Тута засада !!! возможно мультиплексирование подписок !!!!
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
