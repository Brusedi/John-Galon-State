import { TestBed, inject } from '@angular/core/testing';

import { DataAdaptHelperService } from './data-adapt-helper.service';

describe('DataAdaptHelperService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataAdaptHelperService]
    });
  });

  it('should be created', inject([DataAdaptHelperService], (service: DataAdaptHelperService) => {
    expect(service).toBeTruthy();
  }));
});
