import { TestBed, inject } from '@angular/core/testing';

import { DataProvService } from './data-prov.service';

describe('DataProvService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataProvService]
    });
  });

  it('should be created', inject([DataProvService], (service: DataProvService) => {
    expect(service).toBeTruthy();
  }));
});
