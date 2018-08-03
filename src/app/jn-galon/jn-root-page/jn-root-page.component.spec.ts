import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JnRootPageComponent } from './jn-root-page.component';

describe('JnRootPageComponent', () => {
  let component: JnRootPageComponent;
  let fixture: ComponentFixture<JnRootPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JnRootPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JnRootPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
