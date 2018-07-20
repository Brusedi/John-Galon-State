import { QuestionBase } from './question-base';

export class DatePickerQuestion extends QuestionBase<Date> {
  controlType = 'datepicker';
  type: Date;

  constructor(options: {} = {}) {
    super(options);
    this.type = options['type'] || '';
  }
}
