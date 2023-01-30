// Declaring some variables to access to HTML elements.
let searchInput = document.getElementById("search-input");
let todaySection = document.getElementById("today");
let forecastSection = document.getElementById("forecast");
let searchedCitiesArray = JSON.parse(localStorage.getItem('searched-cities')) || [];

// A function to access to the OpenWeather object with the city data.
function fetchCity(cityName, renderButton) {
    let APIKey = "4a57a390d1ee8b328124d4af372fdaec";
    let queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${APIKey}`;

    fetch(queryURL)
        .then(function (response) { return response.json(); })
        .then(function (cityData) {

            // If the code of the city is 200, means it has data to work with.           
            if (cityData.cod === 200) {
                renderCity(cityData);
                fetchForecast(cityData);

                // This parameter prevents a new button to be added to the history section when you click on one city button.     
                // If is true, run the function that updates an array with the names of the searched cities
                // And run the function that renders the city buttons.
                if (renderButton) {
                    updateCitiesArray(cityName)
                    renderLastSearchButtons();
                }
            } else {
                alert("Something went wrong, please try again.");
            }
        });
}

// A function to render the current weather data of the searched city.
function renderCity(cityData) {
    let today = moment();
    todaySection.classList.add("border", "border-dark");
    todaySection.innerHTML =
        `<div class=city-date-icon style="
            display: flex; 
            align-items: center;">
            <h2 id="city-name-date"> ${cityData.name} ${today.format("(DD/MM/YYYY)")} </h2>
            <img id="city-icon" src="http://openweathermap.org/img/wn/${cityData.weather[0].icon}@2x.png" height="60px">
        </div>
        <div class=city-data-today>
            <p id="temperature"> Temperature: ${cityData.main.temp} ºC </p>
            <p id="wind"> Wind speed: ${cityData.wind.speed} m/s </p>
            <p id="humidity"> Humidity: ${cityData.main.humidity}% </p>
        </div>`;
}

// A function to access to the OpenWeather object with the city forecast data.
function fetchForecast(cityData) {
    let APIKey = "4a57a390d1ee8b328124d4af372fdaec";
    let queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityData.name}&units=metric&appid=${APIKey}`;

    fetch(queryURL)
        .then(function (response) { return response.json(); })
        .then(function (forecastData) {
            renderForecast(forecastData);
        });
}

// A function to render the weather forecast data of the searched city.
function renderForecast(forecastData) {
    // An empty object where I will organise all the data I need to manipulate.
    let fiveDaysData = {};

    // An empty array of objects where I will put all the data contained on the hour with the max temp.
    let fiveDaysMaxTemp = [];
    let today = moment();
    forecastSection.innerHTML = "";

    createObjectFiveDaysData(forecastData, fiveDaysData);

    let forecastHeader = document.createElement("div");
    forecastHeader.innerHTML =
        `<div id="forecast-header">
            <h4> 5-Day Forecast </h4>
        </div>`;
    forecastSection.appendChild(forecastHeader);

    let forecastDiv = document.createElement("div");
    forecastDiv.classList.add("row", "justify-content-around");
    forecastSection.appendChild(forecastDiv);

    // A loop to push the data I need on my new object.
    for (let index = 0; index < Object.keys(fiveDaysData).length; index++) {
        let day = Object.keys(fiveDaysData)[index];
        fiveDaysMaxTemp.push(getMaxTemp(day, fiveDaysData));
    }

    // A loop to create 5 cards with the weather data of the next 5 days.
    for (let index = 0; index < fiveDaysMaxTemp.length; index++) {
        let cardDiv = document.createElement("div");
        cardDiv.classList.add("card-body", "border", "border-dark", "col-lg-2", "mx-2", "my-2");
        forecastDiv.appendChild(cardDiv);

        let dateHeader = document.createElement("h5");
        dateHeader.textContent = today.add(1, 'days').format("DD/MM/YYYY");
        cardDiv.appendChild(dateHeader);

        let imgWeather = document.createElement("img");
        imgWeather.src = `http://openweathermap.org/img/wn/${fiveDaysMaxTemp[index].icon}@2x.png`;
        imgWeather.setAttribute("style", "height:60px");
        cardDiv.appendChild(imgWeather);

        displayValues(`Temp: ${fiveDaysMaxTemp[index].temp} ºC`, cardDiv);
        displayValues(`Wind: ${fiveDaysMaxTemp[index].wind} m/s`, cardDiv);
        displayValues(`Humidity: ${fiveDaysMaxTemp[index].humidity} %`, cardDiv);
    }
}

function createObjectFiveDaysData(forecastData, fiveDaysData) {
    let today = moment();

    // A loop through the OpenWeather object to obtain the data I need and push it to my new object.
    for (let index = 0; index < forecastData.list.length; index++) {
        let days = forecastData.list[index].dt_txt;
        let formattedDays = moment(days).format("DD/MM/YYYY");

        let temperature = forecastData.list[index].main.temp;
        let wind = forecastData.list[index].wind.speed;
        let humidity = forecastData.list[index].main.humidity;
        let icon = forecastData.list[index].weather[0].icon;

        // Ignore the data of today, because I don't need it.
        if (formattedDays === today.format("DD/MM/YYYY")) {
            continue;
        }

        if (fiveDaysData[formattedDays] === undefined) {
            fiveDaysData[formattedDays] = [];
        } else {
            fiveDaysData[formattedDays].push({ "temp": temperature, "wind": wind, "humidity": humidity, "icon": icon });
        }
    }
}

// A function to create an array of objects with the weather data of the hour with the max temp.
function getMaxTemp(day, fiveDaysData) {
    let maxTemp = -1000;
    let objWithMaxTemp = {};

    for (let index = 0; index < fiveDaysData[day].length; index++) {

        if (fiveDaysData[day][index].temp > maxTemp) {
            maxTemp = fiveDaysData[day][index].temp;
            objWithMaxTemp = fiveDaysData[day][index];
        }
    }
    return objWithMaxTemp;
}

// A function to put this data on the 5 next days cards.
function displayValues(maxValue, cardDiv) {

    let valueText = document.createElement("p");
    valueText.textContent = maxValue;
    cardDiv.appendChild(valueText);
}

// A function for keeping updated my array of the last 6 searched cities.
// Also to save it on the local storage.
function updateCitiesArray(cityName) {

    if (!cityName) {
        alert("Please write a city");
        return;
    }

    searchedCitiesArray.push(cityName);
    if (searchedCitiesArray.length > 6) {
        searchedCitiesArray.shift();
    }
    localStorage.setItem('searched-cities', JSON.stringify(searchedCitiesArray));
}

// A function to display this last searches cities as buttons.
function renderLastSearchButtons() {
    document.querySelector(".list-group").innerHTML = "";

    for (let index = 0; index < searchedCitiesArray.length; index++) {
        let searchedCity = searchedCitiesArray[index];
        searchedCity = searchedCity.charAt(0).toUpperCase() + searchedCity.slice(1);
        let cityButton = document.createElement("button");
        cityButton.setAttribute("type", "submit");
        cityButton.classList.add("city-button", "btn", "btn-outline-dark", "btn-block", "rounded-0", "mb-3");
        cityButton.innerText = searchedCity;
        document.querySelector(".list-group").prepend(cityButton);
    }
}

renderLastSearchButtons();

// A function for the search button that triggers other functions.
document.getElementById("search-button").addEventListener("click", function (event) {
    let cityName = searchInput.value;
    event.preventDefault();
    fetchCity(cityName, true);
    searchInput.value = "";
});

// A function for the city buttons that triggers other functions.
document.querySelector(".list-group").addEventListener("click", function (event) {
    if (event.target.matches("button")) {

        fetchCity(event.target.textContent, false);
    }
});


