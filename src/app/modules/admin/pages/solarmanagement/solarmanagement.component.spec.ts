import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolarmanagementComponent } from './solarmanagement.component';

describe('SolarmanagementComponent', () => {
  let component: SolarmanagementComponent;
  let fixture: ComponentFixture<SolarmanagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SolarmanagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolarmanagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
