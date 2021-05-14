import { HomeComponent } from './home.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book.model';
import { of } from 'rxjs';

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

const bookServiceMock = {
    getBooks: () => of(listBook)
}

// Mock de un pipe
@Pipe({
    name: 'reduceText'
})
class ReducePipeMock implements PipeTransform {
    transform() : string {
        return '';
    }
}

describe('Test unitarios de HomeComponent', () => {

    let component: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;

    beforeEach( () => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule
            ],
            declarations: [
                HomeComponent,
                ReducePipeMock
            ],
            providers: [
                // BookService // El servicio autentico

                // Mock del servicio
                {
                    provide: BookService,
                    useValue: bookServiceMock
                }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
        })
        .compileComponents();
    });

    /**
     * beforeEach() Se ejecuta lo primero antes de cualquier test
     */
    beforeAll(() => {

    });

    /**
     * befotEach() Se ejecuta antes de cada test
     */
    beforeEach( () => {
        fixture = TestBed.createComponent(HomeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    /**
     * afterEach() se ejecuta despues de cada test
     */
    afterEach( () => {
        fixture.destroy();
        jest.resetAllMocks();
    });

    /**
     * afterAll() se ejecuta despues de todos los test
     */
    afterAll( () => {

    });

    // Test para ver que el componente se ha creado
    it('should create (Se ha creado correctamente', () => {
        expect(component).toBeTruthy();
    });

    // Test para ver como testear un metodo que devuelve un observable
    it('getBooks get books from the subscription', () => {
        const bookService = fixture.debugElement.injector.get(BookService);
        // const spy1 = jest.spyOn(bookService, 'getBooks').mockReturnValueOnce( of( listBook ) ); // of() devuelve un observable (esto solo es necesario si no mockeamos el servicio)
        component.getBooks();
        // expect(spy1).toHaveBeenCalledTimes(1); // solo si usamos el servicio 
        expect(component.listBook.length).toBe(3);
        expect(component.listBook).toEqual(listBook);
    });    
});
