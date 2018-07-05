import { QuestionBase } from './question-base';

export class DateTimePickerQuestion extends QuestionBase<Date> {
  controlType = 'datetimepicker';
  type: string;

  constructor(options: {} = {}) {
    super(options);
    this.type = options['type'] || '';
  }
}
