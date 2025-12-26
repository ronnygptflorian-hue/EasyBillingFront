import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCrearClienteComponent } from './modal-crear-cliente.component';

describe('ModalCrearClienteComponent', () => {
  let component: ModalCrearClienteComponent;
  let fixture: ComponentFixture<ModalCrearClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalCrearClienteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalCrearClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
