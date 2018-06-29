import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JnNewItemComponent } from './jn-new-item.component';

describe('JnNewItemComponent', () => {
  let component: JnNewItemComponent;
  let fixture: ComponentFixture<JnNewItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JnNewItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JnNewItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
