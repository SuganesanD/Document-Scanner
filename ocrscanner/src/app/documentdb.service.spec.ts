import { TestBed } from '@angular/core/testing';

import { DocumentdbService } from './documentdb.service';

describe('DocumentdbService', () => {
  let service: DocumentdbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentdbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
