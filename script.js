// Variable para almacenar la referencia al mapa
let map;

// Función para inicializar el mapa
function initMap() {
    // Crear un nuevo mapa en el elemento con id "map"
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 0, lng: 0 }, // Centrado en (0, 0)
        zoom: 2, // Nivel de zoom inicial
    });
    
    // Obtener el elemento del menú desplegable
    const countrySelect = document.getElementById('countrySelect');

    // Agregar un event listener para el cambio en el menú desplegable
    countrySelect.addEventListener('change', function() {
        const selectedCountry = this.value;
        if (selectedCountry) {
            zoomToCountry(selectedCountry);
            displayCountryInfo(selectedCountry);
        }
    });

    // Obtener los datos de los países desde la API de Rest Countries
    fetch("https://restcountries.com/v3.1/all")
        .then(response => response.json())
        .then(data => {
            // Iterar sobre los datos de los países
            data.forEach(country => {
                // Agregar un marcador para cada país en el mapa
                const geocoder = new google.maps.Geocoder();
                geocoder.geocode({ address: country.name.common }, (results, status) => {
                    if (status === "OK") {
                        const marker = new google.maps.Marker({
                            position: results[0].geometry.location,
                            map: map,
                            title: country.name.common,
                        });

                        // Agregar un event listener para el clic en el marcador
                        marker.addListener('click', () => {
                            zoomToCountry(country.name.common);
                            displayCountryInfo(country.name.common);
                        });
                    }
                });

                // Agregar el país al menú desplegable
                const option = document.createElement('option');
                option.value = country.name.common;
                option.textContent = country.name.common;
                countrySelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error al obtener los datos de los países:', error));
}

// Función para hacer zoom y centrar el mapa en un país específico
function zoomToCountry(countryName) {
    // Geocodificar el nombre del país para obtener sus coordenadas
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: countryName }, (results, status) => {
        if (status === "OK") {
            // Establecer el nivel de zoom y centrar el mapa en las coordenadas del país
            map.setZoom(6); // Ajustar el nivel de zoom según sea necesario
            map.setCenter(results[0].geometry.location); // Centrar el mapa en las coordenadas del país
        } else {
            console.error('Geocodificación fallida para el país:', countryName);
        }
    });
}

// Función para mostrar la información del país seleccionado
function displayCountryInfo(countryName) {
    // Obtener la información del país desde la API de Rest Countries
    fetch(`https://restcountries.com/v3.1/name/${countryName}`)
        .then(response => response.json())
        .then(data => {
            // Extraer la información del primer país de la respuesta
            const country = data[0];
            // Obtener el elemento donde se mostrará la información del país
            const countryInfoDiv = document.getElementById('countryInfo');
            // Actualizar el contenido del elemento con la información del país
            countryInfoDiv.innerHTML = `
                <h2>${country.name.common}</h2>
                <p><strong>Capital:</strong> ${country.capital}</p>
                <p><strong>Población:</strong> ${country.population}</p>
                <p><strong>Región:</strong> ${country.region}</p>
                <p><strong>Subregión:</strong> ${country.subregion}</p>
                <p><strong>Idiomas:</strong> ${Object.values(country.languages).join(', ')}</p>
                <h3>Fotos:</h3>
                <div id="photoContainer"></div>
            `;
            displayCountryPhotos(country.name.common);
        })
        .catch(error => console.error('Error al obtener la información del país:', error));
}

// Función para mostrar fotos del país seleccionado usando la API de Flickr
function displayCountryPhotos(countryName) {
    const apiKey = '6854aa5f44b451781c1d2c678d930c60';
    const url = `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${apiKey}&text=${countryName}&format=json&nojsoncallback=1`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const photos = data.photos.photo;
            const photoContainer = document.getElementById('photoContainer');
            photoContainer.innerHTML = '';

            photos.slice(0, 10).forEach(photo => {
                const photoUrl = `https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_q.jpg`;
                const img = document.createElement('img');
                img.src = photoUrl;
                photoContainer.appendChild(img);
            });
        })
        .catch(error => console.error('Error al obtener las fotos del país:', error));
}

// Llamar a la función para inicializar el mapa cuando la página cargue
window.onload = initMap;
