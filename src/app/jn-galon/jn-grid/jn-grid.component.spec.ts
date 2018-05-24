import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JnGridComponent } from './jn-grid.component';

describe('JnGridComponent', () => {
  let component: JnGridComponent;
  let fixture: ComponentFixture<JnGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JnGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JnGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
