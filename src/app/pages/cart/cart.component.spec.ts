import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { CartComponent } from './cart.component';
import { BookService } from '../../services/book.service';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { Book } from '../../models/book.model';
import { By } from '@angular/platform-browser';

const listBook: Book[] = [
    {
        name: '',
        author: '',
        isbn: '',
        price: 15,
        amount: 2
    },
    {
        name: '',
        author: '',
        isbn: '',
        price: 20,
        amount: 1
    },
    {
        name: '',
        author: '',
        isbn: '',
        price: 8,
        amount: 7
    }
]

/**
 * "describe" ejecuta un conjunto de tests
 * "xdescribe" no los ejecuta
 * "ifdescribe" si hay mas describes solo ejecuta este
 */
describe('Test unitarios de CartComponent', () => {
    
    let component: CartComponent;
    let fixture: ComponentFixture<CartComponent>;
    let service: BookService;

    // El beforEach es como el onInit
    beforeEach( () => {
        // TestBed nos permite cargar la configuracion inicial (como en los modulos)
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule // Fundamental cuando se trabaja con servicios que llaman a una API o cuando llamamos directamente a una API (Porque simula las peticiones)
            ],
            declarations: [
                CartComponent // El componente sobre el que vamos a hacer el test
            ],
            providers: [ // En los providers se ponen los servicios que usamos
                BookService 
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(()=>{ // En este instanciamos el componente
        fixture = TestBed.createComponent(CartComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        /**
         * Como updateAmountBook está en otro servicio, pero un test unitario no debe llamar a otro servicio
         * vamos a simular su llamada.
         */
         service = fixture.debugElement.injector.get(BookService); // Solo para Angular > 9
         // service2 = TestBed.get(BookService); // Para Angular 9 o inferior (actualmente está deprecado)
         jest.spyOn(service, 'getBooksFromCart').mockImplementation( () => listBook);
    });

    afterEach( () => { // Se ejecuta despues de cada test
        fixture.destroy();
        jest.resetAllMocks();
    });

    // Test para ver que el componente se ha creado
    it('should create (Se ha creado correctamente', () => {
        expect(component).toBeTruthy();
    });

    /**
     * OTRA FORMA DE INJECTAR Componentes, PERO PARA ESTO NECESITAMOS QUE CartComponent ESTE EN EL PROVIDER
     */
    // it('should create (Se ha creado correctamente', inject([CartComponent], (component2: CartComponent) => {
    //     expect(component2).toBeTruthy();
    // }));

    // Test para un metodo que tiene un return
    it('getTotalPrice returns an amaunt', ()=>{
        const totalPrice = component.getTotalPrice(listBook);
        expect(totalPrice).toBeGreaterThan(0); // Que el valor que devuelva sea mayor que 0
        expect(totalPrice).not.toBe(0); // Que no devuelva cero
        expect(totalPrice).not.toBeNull(); // Que el numero devuelto no sea nulo
    });

    // Test para un metodo que no devuelve nada (void)
    it('onInputNumberChange increment correctly', () => {
        const action = 'plus';
        const book: Book = listBook[0];
        /**
         * Como necesitamos que los metodos updateAmountBook y getTotalPrice hayan sido llamados correctamente
         * Vamos a usar "espias (spy)" que miran a ver si un metodo a sido llamado o no
         * 
         */
        const spy1 = jest.spyOn(service, 'updateAmountBook').mockImplementation( () => null ); // mockImplementation hace que se llame a la función que se define dentro.
        const spy2 = jest.spyOn(component, 'getTotalPrice').mockImplementation( () => null );  // Como ya la hemos probado antes, no lo volvemos a probar.
        expect(book.amount).toBe(2); // Antes de llamarse el metodo sabemos que vale dos
        component.onInputNumberChange(action, book); // Llamamos al metodo.
        expect(book.amount).toBe(3); // Despues de llamarse el metodo sabemos que debe valer tres
        expect(spy1).toHaveBeenCalledTimes(1); 
        expect(spy2).toHaveBeenCalledTimes(1); // Cuantas veces ha sido llamado
    });
    
    it('onInputNumberChange decrement correctly', () => {
        const action = 'minus';
        const book: Book = listBook[0];
        /**
         * Como necesitamos que los metodos updateAmountBook y getTotalPrice hayan sido llamados correctamente
         * Vamos a usar "espias (spy)" que miran a ver si un metodo a sido llamado o no
         * 
         */
        const spy1 = jest.spyOn(service, 'updateAmountBook').mockImplementation( () => null ); // mockImplementation hace que se llame a la función que se define dentro.
        const spy2 = jest.spyOn(component, 'getTotalPrice').mockImplementation( () => null );  // Como ya la hemos probado antes, no lo volvemos a probar.
        expect(book.amount).toBe(3); // Antes de llamarse el metodo sabemos que vale tres (guarda el incremento anterior, si en lugar de listBook[0], creasemos un objeto con ese libro no ocurriria esto)
        component.onInputNumberChange(action, book); // Llamamos al metodo.
        expect(book.amount).toBe(2); // Despues de llamarse el metodo sabemos que debe valer uno
        expect(book.amount === 2).toBe(true); // Hace lo mismo que la anterior
        expect(spy1).toHaveBeenCalledTimes(1); 
        expect(spy2).toHaveBeenCalledTimes(1); // Cuantas veces ha sido llamado
    });

    // Test a un metodo privado (lo que hacemos es probar el metodo publico que le llama) En este caso onClearBooks llama a _clearListCartBook
    it('onClearBooks works correctly', () => {
        const spy1 = jest.spyOn(service, 'removeBooksFromCart').mockImplementation( () => {});
        const spy2 = jest.spyOn(component as any, '_clearListCartBook'); // El "as any" nos permite espiar un metodo privado (Este no podemos mockeralo porque sino, no lo ejecutaria al llamarle desde onClearBooks)
        component.listCartBook = listBook; // LLenamos la lista de libros
        component.onClearBooks(); // LLamamos al metodo para vaciarlos
        expect(component.listCartBook.length).toBe(0); // La lista debe de tener una longitud de 0 al estar vacia
        expect(spy1).toHaveBeenCalledTimes(1); // Debe de haberse llamado solo una vez.
        expect(spy2).toHaveBeenCalledTimes(1); // Debe de haberse llamado solo una vez.
    });

    /**
     * Forzamos el test de un metodo privado (Pero no es recomendable)
     */
    /**
     * "it" ejecuta el test
     * "xit" no ejecuta el test
     * "fit" de todos los test del discribe solo lanza el que tiene este.
     * "it.only" hace lo mismo que "fit"
     */

    it('_clearListCartBook works correctly', () => {
        const spy1 = jest.spyOn(service, 'removeBooksFromCart').mockImplementation( () => {});
        component.listCartBook = listBook;
        component["_clearListCartBook"]();
        expect(component.listCartBook.length).toBe(0); // La lista debe de tener una longitud de 0 al estar vacia
        expect(spy1).toHaveBeenCalledTimes(1); // Debe de haberse llamado solo una vez.
    });


    /** Test de integración, vamos a ver que la  etiqueta "el carro esta vacio" no se muestre cuando hay una lista*/
    it('The title "The cart is empty" is not displayed when there is a list', () => {
        component.listCartBook = listBook;
        fixture.detectChanges(); // decimos que actualice la vista porque ha habido un cambio (el añadir la lista)
        const debugElement: DebugElement = fixture.debugElement.query(By.css('#titleCartEmpty')); // con query le decimos el id, clase o etiqueta a recuperar (By se importa de '@angular/platform-browser), con queryAll obtendriamos un array de los elementos html que sean (por ejemplo si queremos coger todos lo <p></p> o todos los elementos que contengan una clase)
        expect(debugElement).toBeFalsy(); // Como no debe existir nos debe de devolver un false
    });

    /** Test de integración, vamos a ver que la  etiqueta "el carro esta vacio" se muestre cuando no hay una lista*/
    it('The title "The cart is empty" is displayed correctly when the list is empty', () => {
        component.listCartBook = [];
        fixture.detectChanges();
        const debugElement: DebugElement = fixture.debugElement.query(By.css('#titleCartEmpty'));
        expect(debugElement).toBeTruthy();
        if (debugElement) { // Si existe tratamos de comprobar que contenga el texto deseado
            const element: HTMLElement = debugElement.nativeElement;
            expect(element.innerHTML).toContain('The cart is empty');
        }
    });
});
