import { TestBed, inject } from '@angular/core/testing';

import { DataEngService } from './data-eng.service';

describe('DataEngService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataEngService]
    });
  });

  it('should be created', inject([DataEngService], (service: DataEngService) => {
    expect(service).toBeTruthy();
  }));
});
