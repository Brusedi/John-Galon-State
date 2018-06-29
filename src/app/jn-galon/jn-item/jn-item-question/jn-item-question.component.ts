import { Component, Input } from '@angular/core';
import { QuestionBase } from '../../../shared/question/question-base';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-jn-item-question',
  templateUrl: './jn-item-question.component.html',
  styleUrls: ['./jn-item-question.component.css']
})
export class JnItemQuestionComponent {

  @Input() question: QuestionBase<any>;
  @Input() form: FormGroup;

  get isValid() { return this.form.controls[this.question.key].valid; }

  
}
