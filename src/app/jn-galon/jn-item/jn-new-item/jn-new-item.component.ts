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

  private subscriptions:Subscription[] = [];

  constructor(public adapter:DataAdaptItemService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if( changes["dbc"].firstChange){
      this.initDataStreams();
    }
  }

  private initDataStreams() {

    this.questions$ = this.adapter.dbItemQuestions$(this.dbc, this.rowSeed$)
    this.subscriptions
      .push(
        this.questions$
        .map(this.adapter.toFormGroup)
        .subscribe(  x=> this.form = x )  
      );  
  }

  onSubmit() {
    this.payLoad = JSON.stringify(this.form.value);
  }

  ngOnDestroy(){
    //console.log("check unsubscr");
    while(this.subscriptions.length > 0){
      this.subscriptions.pop().unsubscribe();
    }
  }

}
