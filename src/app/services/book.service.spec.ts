import { BookService } from './book.service';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { Book } from '../models/book.model';
import { environment } from '../../environments/environment.prod';
import swal from 'sweetalert2';


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
];


describe('Test unitarios de BookService', () => {

    let service: BookService; // como component en los componentes
    let httpMock : HttpTestingController; // sustitulle al fixture de los componentes, usamos HttpTestingController para hacer peticiones mock y no reales

    beforeEach( () => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule
            ], // no se usa declarations: [] porque no hay componentes
            providers: [
                BookService
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
        }); // No se usa el compileComponents() porque no se esta usando ningun componente
    });

    beforeEach( ()=> {
        service = TestBed.inject(BookService); // Injectamos el servicio (version angular >= 9)
        // service = TestBed.get(BookService); // Es lo de la linea anterior para versiones de angular anteriores a la 9
        httpMock = TestBed.inject(HttpTestingController); // Obtenemos el httpMock 
    });

    afterEach( () => {
        localStorage.clear(); // Limpiamos el localStorage
        jest.resetAllMocks(); // Reseteamos todos los mocks
    });

    afterAll( () => {
        httpMock.verify(); // Evita que se lance otro test mientras haya peticiones pendientes
    });

    // Test para ver que el servicio se ha creado
    it('should create', () => {
        expect(service).toBeTruthy();
    });

    /**
     * Vamos a comprobar que el metodo get de un servicio haga lo que debe
     */
    it('getBooks return a list of book and does a get method', () => {
        service.getBooks().subscribe((resp: Book[]) => { // con subscribe nos suscribimos al observable
            expect(resp).toEqual(listBook);
        });

        const req = httpMock.expectOne(environment.API_REST_URL + `/book`); // La peticion
        expect(req.request.method).toBe('GET'); // espera que el metodo del request sea get
        req.flush(listBook); // al hacer esto en un httpMock simulamos que la peticion se ha hecho y que la peticion devuelve el contenido en flush()
    });

    /**
     * Test a metodos que usan local storage
     *  para evitar escribir o borrar de localStorage configuramos en el archivo setup-jest.ts el mock de localStorage y sessionStorage con:
     *  const mock = () => {
            let storage: { [key: string]: string } = {};
            return {
                getItem: (key: string) => (key in storage ? storage[key] : null),
                setItem: (key: string, value: string) => (storage[key] = value),
                removeItem: (key: string) => delete storage[key],
                clear: () => (storage = {}),
            };
        };

        Object.defineProperty(window, 'localStorage', { value: mock() });
        Object.defineProperty(window, 'sessionStorage', { value: mock() });
        Object.defineProperty(window, 'getComputedStyle', {
            value: () => ['-webkit-appearance'],
        });
     */
    it('getBooksFromCart return an empty array when localStorage is empty', () => {
        const listBook = service.getBooksFromCart();
        expect(listBook.length).toBe(0);
    });
    
    it('getBooksFromCart return an array of books when it exists in the localStorage', () => {
        localStorage.setItem('listCartBook', JSON.stringify(listBook));
        const newListBook = service.getBooksFromCart(); 
        expect(newListBook.length).toBe(3);
    });
    
    it('addBookToCart add a book successfully when the list does not exits in the localStorage', () => {
        const book: Book = {
            name: '',
            author: '',
            isbn: '',
            price: 15
        };
        const toastMock = {
            fire: () => null
        } as any;
        const spy1 = jest.spyOn(swal, 'mixin').mockImplementation( () => {
            return toastMock; // Este espia necesita un return en la implementacion del mock porque hemos de añadirlo a toastMock porque necesitamos que contenga el metododo fire
        });
        let newListBook = service.getBooksFromCart();
        expect(newListBook.length).toBe(0); // Al tener que estar vacio antes de llamar al metodo deba de estar vacio
        service.addBookToCart(book); // Añadimos uno
        newListBook = service.getBooksFromCart(); // Se vuelve a pedir cuantos libros contiene
        expect(newListBook.length).toBe(1); // Ahora debe de contener 1, el añadido
        expect(spy1).toHaveBeenCalledTimes(1); // Solo se ha debido ejecutar una vez
    });

    // public removeBooksFromCart(): void {
    //     localStorage.setItem('listCartBook', null);
    //   }

    it('removeBooksFromCart removes the list fron the localStorage', () => {
        const toastMock = {
            fire: () => null
        } as any;
        jest.spyOn(swal, 'mixin').mockImplementation( () => {
            return toastMock;
        });
        const book: Book = {
            name: '',
            author: '',
            isbn: '',
            price: 15
        };
        service.addBookToCart(book); // Como esta vacio de inicio, le añadimos uno
        let newListBook = service.getBooksFromCart(); // Obtenemos cuantos libros contiene
        expect(newListBook.length).toBe(1); // Debe de contener el que hemos añadido
        service.removeBooksFromCart(); // Ejecutamos el vaciado
        newListBook = service.getBooksFromCart(); // Obtenemos cuantos libros contiene
        expect(newListBook.length).toBe(0); // Ahora no debe contener ningún libro
    });
});