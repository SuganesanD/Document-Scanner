import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Uploadsample2Component } from './uploadsample2.component';

describe('Uploadsample2Component', () => {
  let component: Uploadsample2Component;
  let fixture: ComponentFixture<Uploadsample2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Uploadsample2Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Uploadsample2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
