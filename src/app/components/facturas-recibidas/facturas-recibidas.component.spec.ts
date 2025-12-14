import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacturasRecibidasComponent } from './facturas-recibidas.component';

describe('FacturasRecibidasComponent', () => {
  let component: FacturasRecibidasComponent;
  let fixture: ComponentFixture<FacturasRecibidasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacturasRecibidasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacturasRecibidasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
