import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JnNotFoundComponent } from './jn-not-found.component';

describe('JnNotFoundComponent', () => {
  let component: JnNotFoundComponent;
  let fixture: ComponentFixture<JnNotFoundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JnNotFoundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JnNotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
