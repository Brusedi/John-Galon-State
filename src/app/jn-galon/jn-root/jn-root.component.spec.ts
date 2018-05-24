import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JnRootComponent } from './jn-root.component';

describe('JnRootComponent', () => {
  let component: JnRootComponent;
  let fixture: ComponentFixture<JnRootComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JnRootComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JnRootComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
