import { TestBed, inject } from '@angular/core/testing';

import { DataAdaptItemService } from './data-adapt-item.service';

describe('DataAdaptItemService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataAdaptItemService]
    });
  });

  it('should be created', inject([DataAdaptItemService], (service: DataAdaptItemService) => {
    expect(service).toBeTruthy();
  }));
});
