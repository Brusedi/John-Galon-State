import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JnItemComponent } from './jn-item.component';

describe('JnItemComponent', () => {
  let component: JnItemComponent;
  let fixture: ComponentFixture<JnItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JnItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JnItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
