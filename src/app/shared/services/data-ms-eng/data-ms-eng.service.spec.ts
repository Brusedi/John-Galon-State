import { TestBed, inject } from '@angular/core/testing';

import { DataMsEngService } from './data-ms-eng.service';

describe('DataMsEngService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataMsEngService]
    });
  });

  it('should be created', inject([DataMsEngService], (service: DataMsEngService) => {
    expect(service).toBeTruthy();
  }));
});
