const API_URL = 'http://127.0.0.1:8000/api';
const token = "1|Xr2d43nuEFANkdsFYvvaZuwpcCjpqQ1DjI6xmHqr1a321027";

async function llamarAPI(metodo, table, datos = {}) {
    let url = `${API_URL}/${table}`;  
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
    const options = { method: metodo, headers };

    // Separar id si existe
    let bodyDatos = { ...datos };
    if (datos.id) {
        url += `/${datos.id}`; // id en la URL
        delete bodyDatos.id;   // quitar id del body
    }

    // Enviar body solo para métodos distintos de GET/HEAD
    if (metodo !== "GET" && metodo !== "HEAD") {
        options.body = JSON.stringify(bodyDatos);
    } else if (Object.keys(bodyDatos).length > 0) {
        const query = new URLSearchParams(bodyDatos).toString();
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

// PUT --> Aldatu objektu bat
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