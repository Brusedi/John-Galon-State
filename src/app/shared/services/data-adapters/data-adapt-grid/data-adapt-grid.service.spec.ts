import { TestBed, inject } from '@angular/core/testing';

import { DataAdaptGridService } from './data-adapt-grid.service';

describe('DataAdaptGridService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataAdaptGridService]
    });
  });

  it('should be created', inject([DataAdaptGridService], (service: DataAdaptGridService) => {
    expect(service).toBeTruthy();
  }));
});
