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
import { TextareaQuestion } from '../../../question/question-textarea';
import { CheckboxQuestion } from '../../../question/question-checkbox';


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
const  BKND_DATE_DATATYPE_NAME_NULABLE = "Date?";
const  BKND_DATETIME_DATATYPE_NAME = "DateTime";
const  BKND_TEXT_DATATYPE_NAME = "Text";
const  BKND_BOOL_DATATYPE_NAME = "boolean";
const  BKND_BOOL_DATATYPE_NAME_NULABLE = "boolean?";

@Injectable()
export class DataAdaptItemService {

  constructor(
    private adapter:DataAdaptBaseService, 
    private fkEngin:DataFkEngService
  ) { }


  /**************************************************************************************************************
  *  Build Questions controls 
  */
  // private buildQuestionBaseOption = (x:FieldDescribe, rowSeed$:Observable<{}>) =>

  //     rowSeed$.subscribe( )  
  
  private buildQuestionBaseOption = (x:FieldDescribe, rowSeed$:Observable<{}>) =>
    ({  
      key: x.altId,
      label:x.name, 
      required:!!x.required, 
      hint: x.description,
      validators: x.validators,
      validationMessages: x.validationMessages,
      order: x.order,
      disabled: !x.editable 
    });
    

  private toTextBox = (x:FieldDescribe, rowSeed$:Observable<{}>) => 
      new TextboxQuestion(  
        this.buildQuestionBaseOption(x, rowSeed$ ) 
      );
        
  private toDropDown = (x:FieldDescribe, rowSeed$:Observable<{}>) => { 
      const buildOptions = (loc:string, rs$:Observable<{}> ) =>
          this.fkEngin.getForeginList$(loc, rs$ ) ;

      const buildBaseOption = (x:FieldDescribe, rowSeed$:Observable<{}>) => {
        var ret = this.buildQuestionBaseOption(x, rowSeed$ );
        ret['options$'] = buildOptions(x.foreignKey, rowSeed$);      
        return ret;
      }
      
      return new DropdownQuestion(buildBaseOption(x,rowSeed$)) ; 
  }

  private toDateTimePicker = (x:FieldDescribe, rowSeed$:Observable<{}>) => { 
    //console.log("toDateTimePicker")
    return new DateTimePickerQuestion(
      this.buildQuestionBaseOption(x, rowSeed$ ) 
   ); 
  }

  private toDatePicker = (x:FieldDescribe, rowSeed$:Observable<{}>) => { 
    //console.log("toDatePicker")
    return new DatePickerQuestion(
      this.buildQuestionBaseOption(x, rowSeed$ ) 
    ); 
  }

  private toTextArea = (x:FieldDescribe, rowSeed$:Observable<{}>) => { 
    //console.log("TextareaQuestion")
    return new TextareaQuestion(
      this.buildQuestionBaseOption(x, rowSeed$ ) 

    ); 
  }

  private toCheckbox = (x:FieldDescribe, rowSeed$:Observable<{}>) => { 
    //console.log("toDatePicker")
    return new CheckboxQuestion(
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
        .filter( x => ( x.visible != false ))   //  only visible
        .map(toCdata) 
        //.do(x=> console.log(x))
        .map( ifEmptyAnd( (x:cdata) => x.descr.foreignKey?true:false                    , this.toDropDown ) )
        .map( ifEmptyAnd( (x:cdata) => x.descr.type === BKND_DATETIME_DATATYPE_NAME     , this.toDateTimePicker ) )
        .map( ifEmptyAnd( (x:cdata) => x.descr.type === BKND_DATE_DATATYPE_NAME         , this.toDatePicker ) )
        .map( ifEmptyAnd( (x:cdata) => x.descr.type === BKND_DATE_DATATYPE_NAME_NULABLE , this.toDatePicker ) )
        .map( ifEmptyAnd( (x:cdata) => x.descr.type === BKND_TEXT_DATATYPE_NAME         , this.toTextArea ) )
        .map( ifEmptyAnd( (x:cdata) => x.descr.type === BKND_BOOL_DATATYPE_NAME         , this.toCheckbox ) )
        .map( ifEmptyAnd( (x:cdata) => x.descr.type === BKND_BOOL_DATATYPE_NAME_NULABLE , this.toCheckbox ) )
        .map( ifEmptyAnd( (x:cdata) => true, this.toTextBox ) )
        .map( fromCdata )
        //.do(x=> console.log(x))
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
   * @param rowSeed  - INIT VALUES
   */
  toFormGroup(questions: QuestionBase<any>[], rowSeed:{}) {
    let group: any = {};
    

    questions
      .forEach(question => {
        //console.log(question);  
        const cutSecondTailMatch = (x) =>  x.match(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d/) ;
        const cutSecondTailMatchCheck = (x,def) => ( x != null && x.length > 0 ) ? x[0] : def ;
        const cutSecondTail = (x) => (typeof x === "string") ? cutSecondTailMatchCheck( cutSecondTailMatch(x), x ) : x ;

        const initVal =
          (question.constructor.name == "DateTimePickerQuestion") 
            ? cutSecondTail(rowSeed[question.key])
            : (  rowSeed[question.key] != null ?  rowSeed[question.key] : question.value || '' ) ; 

        const cntrl = new FormControl( initVal, question.validators);    
        
        if( question.disabled ){
          cntrl.disable();    
          //console.log('пук!');
        }  

        group[question.key] = cntrl;    

        //question.disabled?{ group[question.key].disable();   }:null;

        //const  fc = new FormControl( {value:initVal, }, question.validators);
        // fc.disable();
        // group[question.key] = fc;
        ////group[question.key] = new FormControl( {value:initVal  }, question.validators);

        //group[question.key] = new FormControl( initVal, question.validators);

        //, disable: question.disabled
                                               
    });

   
    return new FormGroup(group);
  }

  //toFormGroupSet = (questions: QuestionBase<any>[] ) => ({formGroup: this.toFormGroup(questions), needChangeFields:   }) 
  
  toFormGroup$(questions$: Observable<QuestionBase<any>[]> ){
    return questions$.map(this.toFormGroup).do(console.log);
  }  

  /**
   * Add data to template
   * @param template 
   * @param data 
   */
  mergeToTemplate = ( template: {}, data:{} ) => ({ ...template, ...data })

}
