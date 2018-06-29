import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JnItemQuestionComponent } from './jn-item-question.component';

describe('JnItemQuestionComponent', () => {
  let component: JnItemQuestionComponent;
  let fixture: ComponentFixture<JnItemQuestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JnItemQuestionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JnItemQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
