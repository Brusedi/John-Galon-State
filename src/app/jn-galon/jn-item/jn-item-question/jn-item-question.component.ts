import { Component, Input } from '@angular/core';
import { QuestionBase } from '../../../shared/question/question-base';
import { FormGroup } from '@angular/forms';
//import {ErrorStateMatcher} from '@angular/material/core';

const DEF_VALID_ERROR = "Неверное значение";

@Component({
  selector: 'app-jn-item-question',
  templateUrl: './jn-item-question.component.html',
  styleUrls: ['./jn-item-question.component.css']
})

export class JnItemQuestionComponent {
  

  @Input() question: QuestionBase<any>;
  @Input() form: FormGroup;

  get isValid() { return this.form.controls[this.question.key].valid; }

  hasError(errorCode: string, path?: string[]) { return this.form.controls[this.question.key].hasError(errorCode, path); }

  errorMessage() { 
    const r = Object.keys(this.question.validationMessages).find( (x) => this.hasError(x) ) ;
    return r == undefined ? DEF_VALID_ERROR : this.question.validationMessages[r] ; 
  }
  
  //matcher = new ErrorStateMatcher();

}
