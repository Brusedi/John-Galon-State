import { TestBed, inject } from '@angular/core/testing';

import { DataAdaptForeginKeyProvService } from './data-adapt-foregin-key-prov.service';

describe('DataAdaptForeginKeyProvService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataAdaptForeginKeyProvService]
    });
  });

  it('should be created', inject([DataAdaptForeginKeyProvService], (service: DataAdaptForeginKeyProvService) => {
    expect(service).toBeTruthy();
  }));
});
