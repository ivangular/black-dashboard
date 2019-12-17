import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipanelLayoutComponent } from './multipanel-layout.component';

describe('AdminLayoutComponent', () => {
  let component: MultipanelLayoutComponent;
  let fixture: ComponentFixture<MultipanelLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MultipanelLayoutComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultipanelLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
