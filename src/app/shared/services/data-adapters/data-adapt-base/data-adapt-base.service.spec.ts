import { TestBed, inject } from '@angular/core/testing';

import { DataAdaptBaseService } from './data-adapt-base.service';

describe('DataAdaptBaseService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataAdaptBaseService]
    });
  });

  it('should be created', inject([DataAdaptBaseService], (service: DataAdaptBaseService) => {
    expect(service).toBeTruthy();
  }));
});
