import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup }                from '@angular/forms';

import { Db } from '../../../shared/services/data-ms-eng/data-ms-eng.service';
import { QuestionBase } from '../../../shared/question/question-base';
import { DataAdaptItemService } from '../../../shared/services/data-adapters/data-adapt-item/data-adapt-item.service';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { Store } from '@ngrx/store';

import  *  as fromStore from '@appStore/index'
import { JnChangeSource, JnAddItem } from '@appStore/actions/jn.actions';


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
  loc     = '';

  private rowSeed$ = new BehaviorSubject({});  

  private questionsSet$: Observable<{ questions:QuestionBase<any>[] ; fields:string[]}  >;
  private subscriptions:Subscription[] = [];

  private rowTemplate : {};

  constructor(
    private store: Store<fromStore.State>,
    public adapter:DataAdaptItemService
     ) { }

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
    const formSetInitValues = ( frm:FormGroup, flds:string[], rowTemplate, questions ) => 
      Object.keys(rowTemplate)
        .map(x => ({ fld:frm.get(x), val:rowTemplate[x] }) )
        .filter(x => x.fld !== null && x.val !== null )
        .forEach( x =>  {x.fld.setValue(x.val); console.log(questions)  })


    // базовые стримы после адаптера
    this.questionsSet$ = this.adapter.dbItemQuestionsWithDepFields$(this.dbc, this.rowSeed$) ;

    this.questions$ = 
      this.questionsSet$
        .map( x => 
          x.questions
            .sort( (a, b) => a.order - b.order  )
        )
        //.do(x=>console.log(x))

    // отписаться не забудь...    


   this.subscriptions
      .push(
        this.questionsSet$
          .combineLatest( this.dbc.template$, (qs,t) => ({ questions:qs.questions, fields:qs.fields, rowTemplate:t }) )  // add row template
          .subscribe( x => {  
            this.rowTemplate = x.rowTemplate ;
            this.form = this.adapter.toFormGroup( x.questions , x.rowTemplate ); 
            formChangeSubscribeTarget(this.form, x.fields); //TODO Тута засада !!! возможно мультиплексирование подписок !!!! (Да вроде все норм...)
            this.rowSeed$.next( this.form.value );          // ресетим значения штобы заполнилась вторичка ! 
            //formSetInitValues(this.form, x.fields, x.rowTemplate, x.questions ) ;    // Устанавливаем начальные значения из темплэйта без подписки !!
            //formChangeSubscribe(this.form);
          })
      );  

    this.subscriptions.push(this.store.subscribe( x=> this.loc = x.jn.location) ) ;

  }

  onSubmit() {
    this.store.dispatch( 
      new JnAddItem( { 
        location: this.loc , 
        data:( {...this.rowTemplate,  ...(this.form.value) } ) } 
        ) );    
  }

  ngOnDestroy(){
    console.log("check unsubscr item");
    while(this.subscriptions.length > 0){
      this.subscriptions.pop().unsubscribe();
    }
  }

}
