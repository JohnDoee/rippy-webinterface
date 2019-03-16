import { TestBed } from '@angular/core/testing';

import { RippyService } from './rippy.service';

describe('RippyService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RippyService = TestBed.get(RippyService);
    expect(service).toBeTruthy();
  });
});
