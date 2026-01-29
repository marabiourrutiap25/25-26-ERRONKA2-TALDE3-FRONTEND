const API_URL = 'http://127.0.0.1:8000/api';

// Funtzio orokorra API deietarako
async function llamarAPI(metodo, table, datos = {}) {
    let url = `${API_URL}/${table}`;  // Asumimos API_URL definido arriba
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

    const options = { method: metodo, headers };

    if (metodo !== "GET" && metodo !== "HEAD") {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(datos)) {
            if (value !== null && value !== undefined) params.append(key, value);
        }
        options.body = params.toString();
    } else if (Object.keys(datos).length > 0) {
        const query = new URLSearchParams(datos).toString();
        url += `?${query}`;
    }

    const response = await fetch(url, options);

    const text = await response.text();
    let resultado = null;
    try {
        resultado = text ? JSON.parse(text) : null;
    } catch (err) {
        console.error('Respuesta no es JSON:', { status: response.status, text });
        throw new Error(`API devolvió no JSON. Estado: ${response.status}`);
    }

    if (!response.ok) {
        const mensaje = resultado?.error || `HTTP error ${response.status}`;
        throw new Error(mensaje);
    }

    return resultado;
}


// GET --> Lortu lerro guztiak
async function cargarObjetos(table) {
    try {
        // Llamada a la API
        const resultado = await llamarAPI('GET', table);
        console.log('Respuesta bruta de API:', resultado);
        
        // Verificar si es un array directamente
        if (Array.isArray(resultado)) {
            console.log('Es un array:', resultado);
            return resultado;
        }
        
        // Si es un objeto, buscar el array dentro (común: data, results, items, etc.)
        if (resultado && typeof resultado === 'object') {
            const dataArray = resultado.data || resultado.results || resultado.items || resultado;
            console.log('Datos extraídos:', dataArray);
            if (Array.isArray(dataArray)) {
                return dataArray;
            }
        }
        
        console.warn('Estructura inesperada, devolviendo array vacío');
        return [];
    } catch (err) {
        console.error('Error al cargar datos:', err);
        // Devolver array vacío si falla
        return [];
    }
}

// GET --> Lortu lerro bat
async function cargarObjeto(aldagaia, table) {
    try {
        //APIra deitu eta emaitza jaso
        const resultado = await llamarAPI('GET', table, aldagaia);
        return resultado;
    } catch (err) {
        console.error('Error al cargar datos:', err);
        return null;
    }
}

// PUT --> Sortu objektu bat
async function aldatuObjeto(aldagaiak, table) {
    try {
        // API deia egin PUT metodoarekin
        const result = await llamarAPI('PUT', table, aldagaiak);
        return result;
    } catch (err) {
        console.error('Error:', err);
        return null;
    }
}

// DEL --> Ezabatu objektu bat
async function ezabatuObjektua(aldagaia, table) {
    try {
        const result = await llamarAPI('DELETE', table, aldagaia);
        return result;
    } catch (err) {
        console.error('Error al eliminar:', err);
        alert('Error al eliminar el equipo: ' + err.message);
        return null;
    }
}

// POST --> Sortu objektu bat
async function crearObjektua(aldagaiak, table) {
    try {
        const result = await llamarAPI('POST', table, aldagaiak);
        return result;
    } catch (err) {
        console.error('Error al crear erabiltzailea:', err);
        return null;
    }
}

// Funtzio laguntzailea: API URL eguneratua lortzeko
async function revisarSesion(tablename){
    return API_URL + '/' + tablename;
}

export default {
  cargarObjetos,
  cargarObjeto,
  aldatuObjeto,
  ezabatuObjektua,
  crearObjektua,
  revisarSesion
}