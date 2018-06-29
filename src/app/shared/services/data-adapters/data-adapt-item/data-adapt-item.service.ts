import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { QuestionBase } from '../../../question/question-base';
import { DropdownQuestion } from '../../../question/question-dropdown';
import { TextboxQuestion } from '../../../question/question-textbox';

import { Db } from '../../data-ms-eng/data-ms-eng.service';
import { DataAdaptBaseService, FieldDescribe } from '../data-adapt-base/data-adapt-base.service';
import { Observable } from 'rxjs';

import 'rxjs/add/operator/map'
import { map, mergeMap } from 'rxjs/operators';
import { DataFkEngService } from '../../data-fk-eng/data-fk-eng.service';
import { forEach } from '@angular/router/src/utils/collection';


// простой функтор
class functor<T>{
  constructor(public val:T){}
  map = <T2>(f:((x:T) => T2)) => new functor( f( this.val ) ) ;
}

// local helper
interface cdata { descr:FieldDescribe ; ctrl?:QuestionBase<any>; rowSeed$:Observable<{}> } ;    // контейнер для конвеера
type cfactory =  (descr:FieldDescribe,  rowSeed$:Observable<{}> ) => QuestionBase<any> ;      
const ifEmptyAnd = ( c:( (x:cdata) => boolean ) , f:cfactory)  =>  ( (x:cdata) =>  x.ctrl || ! c(x) ? x : { descr:x.descr, ctrl:f(x.descr, x.rowSeed$), rowSeed$:x.rowSeed$ } );



@Injectable()
export class DataAdaptItemService {

  constructor(
    private adapter:DataAdaptBaseService, 
    private fkEngin:DataFkEngService
  ) { }
  //*****************************************************

  private toTextBox = (x:FieldDescribe, rowSeed$:Observable<{}>) => 
      new TextboxQuestion({  
          key: x.altId,
          label:x.name 
      }) ;

  private toDropDown = (x:FieldDescribe, rowSeed$:Observable<{}>) => { 
      const buildOptions = (loc:string, rs$:Observable<{}> ) =>
      this.fkEngin.getForeginList(loc, rs$ ) ;


      return new DropdownQuestion({  
        key: x.altId,
        label:x.name, 
        //options: this.buildDropDownItems(x)
        //optionsLoc:x.foreignKey
        options$: buildOptions(x.foreignKey, rowSeed$) 
      }); 
  }

  /**
   * Build Item Question set for dbsource
   * @param dataSourse 
   */
  dbItemQuestions$(dataSourse:Db, rowSeed:Observable<{}>){
    const toCdata = ( d:FieldDescribe) => ( { descr:d , ctrl:null } as cdata );   
    const fromCdata = ( d:cdata) =>  d.ctrl ;   
    const proccColumns = (columns:FieldDescribe[] ) =>  
        Observable.from(columns)
        .map(toCdata) 
        .map(  ifEmptyAnd( (x:cdata) => x.descr.foreignKey?true:false , this.toDropDown ) )
        .map(  ifEmptyAnd( (x:cdata) => true, this.toTextBox ) )
        .map(fromCdata)
        .toArray();

    return this.adapter.toGridColumns(dataSourse.fieldsMeta$)
        .mergeMap(proccColumns);
  }  


  //*******************************************************  
  /**
   * Build Drop down itens by FieldDescribe
   * @param descr 
   */
  private buildDropDownItems(descr:FieldDescribe ){
    return [
      {key: 'solid',  value: 'Solid'},
      {key: 'great',  value: 'Great'},
      {key: 'good',   value: 'Good'},
      {key: 'unproven', value: 'Unproven'}
    ];
  }

  /**
   * Build Item Question set for dbsource
   * @param dataSourse 
   */
  dbItemQuestions(dataSourse:Db){
    // mock data 
    // todo

    let questions: QuestionBase<any>[] = [

      new DropdownQuestion({
        key: 'brave',
        label: 'Bravery Rating',
        options: [
          {key: 'solid',  value: 'Solid'},
          {key: 'great',  value: 'Great'},
          {key: 'good',   value: 'Good'},
          {key: 'unproven', value: 'Unproven'}
        ],
        order: 3
      }),

      new TextboxQuestion({
        key: 'firstName',
        label: 'First name',
        value: 'Bombasto',
        required: true,
        order: 1
      }),

      new TextboxQuestion({
        key: 'emailAddress',
        label: 'Email',
        type: 'email',
        order: 2
      })
    ];

    return questions.sort((a, b) => a.order - b.order);
  }


  toFormGroup(questions: QuestionBase<any>[] ) {
    let group: any = {};

    questions.forEach(question => {
      group[question.key] = question.required ? new FormControl(question.value || '', Validators.required)
                                              : new FormControl(question.value || '');
    });
    return new FormGroup(group);
  }

  
  toFormGroup$(questions$: Observable<QuestionBase<any>[]> ){
    return questions$.map(this.toFormGroup).do(console.log);
        
  }  



}
