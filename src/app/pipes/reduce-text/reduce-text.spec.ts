import { ReduceTextPipe } from './reduce-text.pipe';

describe('Test unitarios del pipe ReduceTextPipe', () => {

    let pipe: ReduceTextPipe; // como component en los test de componentes

    beforeEach( () => {
        pipe = new ReduceTextPipe(); // Solo instanciamos el pipe para que por cada test se creé una instancia nueva
    });

    it('should create', () => {
        expect(pipe).toBeTruthy();
    });

    it('use transform correctly', () => {
        const text = 'Hello this is a test to check the pipe';
        const newText = pipe.transform(text, 5); // Ejecutamos la funcion pasandole los argumentos correspondientes
        expect(newText.length).toBe(5);
    });
});