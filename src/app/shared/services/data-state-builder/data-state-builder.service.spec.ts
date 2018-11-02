import { TestBed, inject } from '@angular/core/testing';

import { DataStateBuilderService } from './data-state-builder.service';

describe('DataStateBuilderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataStateBuilderService]
    });
  });

  it('should be created', inject([DataStateBuilderService], (service: DataStateBuilderService) => {
    expect(service).toBeTruthy();
  }));
});
