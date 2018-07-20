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
import { DateTimePickerQuestion } from '../../../question/question-datetimepicker';
import { DatePickerQuestion } from '../../../question/question-datepicker';


// простой функтор
class functor<T>{
  constructor(public val:T){}
  map = <T2>(f:((x:T) => T2)) => new functor( f( this.val ) ) ;
}

// local helper
interface cdata { descr:FieldDescribe ; ctrl?:QuestionBase<any>; rowSeed$:Observable<{}> } ;    // контейнер для конвеера
type cfactory =  (descr:FieldDescribe,  rowSeed$:Observable<{}> ) => QuestionBase<any> ;      
const ifEmptyAnd = ( c:( (x:cdata) => boolean ) , f:cfactory)  =>  ( (x:cdata) =>  x.ctrl || ! c(x) ? x : { descr:x.descr, ctrl:f(x.descr, x.rowSeed$), rowSeed$:x.rowSeed$ } );

const  BKND_DATE_DATATYPE_NAME = "Date";
const  BKND_DATETIME_DATATYPE_NAME = "DateTime";


@Injectable()
export class DataAdaptItemService {

  constructor(
    private adapter:DataAdaptBaseService, 
    private fkEngin:DataFkEngService
  ) { }


  /**************************************************************************************************************
  *  Build Questions controls 
  */
  private buildQuestionBaseOption = (x:FieldDescribe, rowSeed$:Observable<{}>) =>
    ({  
      key: x.altId,
      label:x.name, 
      required:!!x.required, 
      hint: x.description,
      validators: x.validators,
      validationMessages: x.validationMessages  
    });

  private toTextBox = (x:FieldDescribe, rowSeed$:Observable<{}>) => 
      new TextboxQuestion(  
        this.buildQuestionBaseOption(x, rowSeed$ ) 
      );
        
  private toDropDown = (x:FieldDescribe, rowSeed$:Observable<{}>) => { 
      const buildOptions = (loc:string, rs$:Observable<{}> ) =>
          this.fkEngin.getForeginList$(loc, rs$ ) ;

      return new DropdownQuestion({  
        key: x.altId,
        label:x.name, 
        //options: this.buildDropDownItems(x)
        //optionsLoc:x.foreignKey
        options$: buildOptions(x.foreignKey, rowSeed$) 
      }); 
  }

  private toDateTimePicker = (x:FieldDescribe, rowSeed$:Observable<{}>) => { 
    console.log("toDateTimePicker")
    return new DateTimePickerQuestion(
      this.buildQuestionBaseOption(x, rowSeed$ ) 
   ); 
  }

  private toDatePicker = (x:FieldDescribe, rowSeed$:Observable<{}>) => { 
    console.log("toDatePicker")
    return new DatePickerQuestion(
      this.buildQuestionBaseOption(x, rowSeed$ ) 
    ); 
  }
  //***********************************************************************************************************************/

  /**
   * Build Item Question set for dbsource
   * @param dataSourse 
   */
  dbItemQuestions$(dataSourse:Db, rowSeed:Observable<{}>){
    const toCdata = ( d:FieldDescribe) => ( { descr:d , ctrl:null, rowSeed$:rowSeed } as cdata );   // ????rowSeed
    const fromCdata = ( d:cdata) =>  d.ctrl ;   
    const proccColumns = (columns:FieldDescribe[] ) =>  
        Observable.from(columns)
        //.do( x=> console.log(x) )
        .map(toCdata) 
        .map(  ifEmptyAnd( (x:cdata) => x.descr.foreignKey?true:false , this.toDropDown ) )
        //.do( x=> console.log(x) )
        .map(  ifEmptyAnd( (x:cdata) => x.descr.type === BKND_DATETIME_DATATYPE_NAME , this.toDateTimePicker ) )
        .map(  ifEmptyAnd( (x:cdata) => x.descr.type === BKND_DATE_DATATYPE_NAME , this.toDatePicker ) )
        //.map(  ifEmptyAnd( (x:cdata) => x.descr.type === BKND_DATE_DATATYPE_NAME , this.toDatePicker ) )
        //.do( x=> console.log(x) )
        .map(  ifEmptyAnd( (x:cdata) => true, this.toTextBox ) )
        .map(fromCdata)
        .toArray();

    //rowSeed.do(x=>console.log(x)) ;       
    return this.adapter.toGridColumns(dataSourse.fieldsMeta$)
        .mergeMap(proccColumns);

    //  return questions.sort((a, b) => a.order - b.order);        
  } 
  
   

  /**
   * Return field list for depend control...
   * @param dataSourse 
   */
  getDependedOwnerFields$(dataSourse:Db){
    const arayOfArayToAray = (source:string[][]) => 
      source.reduce( ((a:string[],i)=> a.concat(i) ) ,[] )

    const proccColumns = (columns:FieldDescribe[] ) =>  
      Observable.from(columns)
      .map(x=>x.foreignKey )
      .filter( x => ( x !== null && x != undefined  )  )
      .map( this.fkEngin.getDependOwner) 
      .toArray()
      .map(arayOfArayToAray)

      
    return  this.adapter.toGridColumns(dataSourse.fieldsMeta$)
        //.do(x=> console.log('getDependedOwnerFields') )
        .mergeMap(proccColumns);
  }

  /**
   * Возвращает сет со списком полей изменения которых надо отслеживать  
   */ 
  dbItemQuestionsWithDepFields$(dataSourse:Db, rowSeed:Observable<{}>){
      return this.dbItemQuestions$(dataSourse,rowSeed)
        .combineLatest( this.getDependedOwnerFields$( dataSourse), (q,f) => ({ questions:q , fields:f }) )

  }  


  /**
   * Convert  question set to angular FormGroup  
   * @param questions 
   */
  toFormGroup(questions: QuestionBase<any>[] ) {
    let group: any = {};

    questions.forEach(question => {
      // group[question.key] = question.required ? new FormControl(question.value || '', Validators.required)
      //                                         : new FormControl(question.value || '');
      //console.log( question.validationMessages);
      //console.log( question.validators);

      group[question.key] = new FormControl( question.value || '', question.validators)
                                               
    });
    return new FormGroup(group);
  }

  //toFormGroupSet = (questions: QuestionBase<any>[] ) => ({formGroup: this.toFormGroup(questions), needChangeFields:   }) 

  
  toFormGroup$(questions$: Observable<QuestionBase<any>[]> ){
    return questions$.map(this.toFormGroup).do(console.log);
  }  

}
