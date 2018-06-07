import { TestBed, inject } from '@angular/core/testing';

import { DataFkEngService } from './data-fk-eng.service';

describe('DataFkEngService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataFkEngService]
    });
  });

  it('should be created', inject([DataFkEngService], (service: DataFkEngService) => {
    expect(service).toBeTruthy();
  }));
});
