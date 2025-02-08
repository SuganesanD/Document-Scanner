import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadtextComponent } from './uploadtext.component';

describe('UploadtextComponent', () => {
  let component: UploadtextComponent;
  let fixture: ComponentFixture<UploadtextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadtextComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UploadtextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
