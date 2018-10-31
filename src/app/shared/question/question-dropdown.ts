import { QuestionBase } from './question-base';
import { Observable } from 'rxjs';

export class DropdownQuestion extends QuestionBase<string> {
  controlType = 'dropdown';
  options: {key: string, value: string}[] = [];
  options$: Observable<{key: string, value: string}[]> = null;

  constructor(options: {} = {} ) {
    super(options);
    this.options = options['options'] || [];
    this.options$ = options['options$'] || null;
    //console.log(this.order);
  }
}


/*
Copyright 2017-2018 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/