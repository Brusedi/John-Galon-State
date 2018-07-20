import { ValidatorFn } from "@angular/forms";

export class QuestionBase<T> {
  value: T;
  key: string;
  label: string;
  hint: string;
  required: boolean;
  order: number;
  controlType: string;
  validators:ValidatorFn[]; 
  validationMessages : { [key: string]: string } ; 
  

  constructor(options: {
      value?: T,
      key?: string,
      label?: string,
      hint?: string,
      required?: boolean,
      order?: number,
      controlType?: string,
      validators?:ValidatorFn[]; 
      validationMessages? : { [key: string]: string }  
      
    } = {}) {

    this.value = options.value;
    this.key = options.key || '';
    this.label = options.label || '';
    this.hint = options.hint || '';
    this.required = !!options.required;
    this.order = options.order === undefined ? 1 : options.order;
    this.controlType = options.controlType || '';
    this.validators = options.validators || [];
    this.validationMessages = options.validationMessages || {};
    //console.log( options.required);
    //console.log( this.required);
  }

  getExLabel = () => this.label + ( this.required ? " *":"") ;

}


/*
Copyright 2017-2018 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/