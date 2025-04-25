import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSheetComponent } from './timeSheet.component';

describe('TimetableComponent', () => {
  let component: TimeSheetComponent;
  let fixture: ComponentFixture<TimeSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeSheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
