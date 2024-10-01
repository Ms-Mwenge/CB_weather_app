// query all sectors
const cityInput = document.querySelector(".city-input");
const searchBtn = document.querySelector(".search-btn");

const weatherInfoSection = document.querySelector(".weather-info");
const notFoundSection = document.querySelector(".not-found");

const countryTxt = document.querySelector(".country-txt");
const tempTxt = document.querySelector(".temp-txt");
const conditionTxt = document.querySelector(".condition-txt");
const humidityValueTxt = document.querySelector(".humidity-value-txt");
const windValueTxt = document.querySelector(".wind-value-txt");
const weatherSummaryImg = document.querySelector(".weather-summary-img");
const currentDateTxt = document.querySelector(".current-date-txt");
const localTimeElement = document.querySelector(".local-time");
const greetingElement = document.querySelector(".greeting-txt");
const mainTag = document.querySelector("main");

const forecastItemsContainer = document.querySelector(
  ".forecast-items-container"
);

// OpenWeatherAPI Key
const apiKey = "72072ab5f875ae67618e0d33db966268";

// on load, show weather for provincial headquarters
function initialize() {
  // setting current city to provincial headquarters
  const provincialHQ = "ndola";
  updateWeatherInfo(provincialHQ);
}

window.onload = initialize;

// Event Lister for search button and search input
searchBtn.addEventListener("click", () => {
  if (cityInput.value.trim() != "") {
    updateWeatherInfo(cityInput.value);
    cityInput.value = "";
    cityInput.blur();
  }
});
cityInput.addEventListener("keydown", event => {
  if (event.key == "Enter" && cityInput.value.trim() != "") {
    updateWeatherInfo(cityInput.value);
    cityInput.value = "";
    cityInput.blur();
  }
});

// Fetch API to get data from openWeatherAPI
async function getFetchData(endPoint, city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`;

  const response = await fetch(apiUrl);
  return response.json();
}

// get weather icon based on weather condition
function getWeaatherIcon(id) {
  if (id <= 232) return "thunderstorm.svg";
  if (id <= 321) return "drizzle.svg";
  if (id <= 531) return "rain.svg";
  if (id <= 622) return "snow.svg";
  if (id <= 781) return "atmosphere.svg";
  if (id <= 800) return "clear.svg";
  else return "cloudy.svg";
}

// get current  date

function getCurrentDate() {
  const currentDate = new Date();
  const options = {
    weekday: "short",
    day: "2-digit",
    month: "short"
  };

  return currentDate.toLocaleDateString("en-GB", options);
}

// get time
function getLocalTime() {
  const currentTime = new Date();
  const options = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  };

  return currentTime.toLocaleTimeString("en-GB", options);
}

function updateLocalTime() {
  localTimeElement.textContent = getLocalTime();
  setTimeout(updateLocalTime, 1000);
}

updateLocalTime();
const currentTime = new Date();
const hour = currentTime.getHours();
const greeting =
  hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
greetingElement.textContent = greeting;

// Update fetched weather information for veiwing
async function updateWeatherInfo(city) {
  // Show loader before fetching data
  showLoader();

  const weatherData = await getFetchData("weather", city);

  // Hide loader after data is fetched
  hideLoader();

  //show not found message
  if (weatherData.cod != 200) {
    showDisplaySection(notFoundSection);
    mainTag.style.display = "none";
    return;
  }

  //   set main back to view
  mainTag.style.display = "block";

  // get weather data
  const {
    name: country,
    main: { temp, humidity },
    weather: [{ id, main }],
    wind: { speed }
  } = weatherData;

  updateBackground(main.toLowerCase());

  countryTxt.textContent = country;
  tempTxt.textContent = Math.round(temp) + "°C";
  conditionTxt.textContent = main;
  humidityValueTxt.textContent = humidity + "%";
  windValueTxt.textContent = speed + " mph";

  currentDateTxt.textContent = getCurrentDate();
  weatherSummaryImg.src = `assets/weather/${getWeaatherIcon(id)}`;

  await updateForecastsInfo(city);

  console.log(weatherData); //console log data for debugging

  showDisplaySection(weatherInfoSection);
}

// get 5-days  weather forecast data
async function updateForecastsInfo(city) {
  const forecastsData = await getFetchData("forecast", city);

  const timeTaken = "12:00:00";
  const todayDate = new Date().toISOString().split("T")[0];

  forecastItemsContainer.innerHTML = "";
  forecastsData.list.forEach(forecastWeather => {
    if (
      forecastWeather.dt_txt.includes(timeTaken) &&
      !forecastWeather.dt_txt.includes(todayDate)
    ) {
      updateForecastItems(forecastWeather);
    }
  });
}

// Update weather forecast

function updateForecastItems(weatherData) {
  const {
    dt_txt: date,
    weather: [{ id, main: weatherCondition }],
    main: { temp }
  } = weatherData;

  const dateTaken = new Date(date);
  const dateOption = {
    day: "2-digit",
    month: "short"
  };
  const dateResult = dateTaken.toLocaleDateString("en-US", dateOption);

  const forecastItem = `
          <div class="forecast-item glass-effect">
              <h5 class="forecast-item-date regular-txt">${dateResult}</h5>
              <img src="assets/weather/${getWeaatherIcon(
                id
              )}" class="forecast-item-img">
              <h5 class="forecast-item-temp">${Math.round(temp)}°C</h5>
              <p class="forecast-item-condition">${weatherCondition}</p>
          </div>
      `;

  forecastItemsContainer.insertAdjacentHTML("beforeend", forecastItem);
}

// display weather information
function showDisplaySection(section) {
  [weatherInfoSection, notFoundSection].forEach(
    section => (section.style.display = "none")
  );

  section.style.display = "block";
}

// functions to show and hide the loader
function showLoader() {
  loaderElement.style.display = "block";
}
function hideLoader() {
  loaderElement.style.display = "none";
}

function updateBackground(weatherCondition) {
  const weatherConditions = {
    clear: "sunny.jpg",
    clouds: "cloudy.jpg",
    rain: "rainy.jpg",
    thunderstorm: "rainy.jpg",
    drizzle: "rainy.jpg",
    snow: "snow.jpg",
    atmosphere: "atmosphere.jpg"
  };

  const backgroundUrl = weatherConditions[weatherCondition] || "default.jpg";

  // Set the background image
  mainTag.style.backgroundImage = `url('assets/images/${backgroundUrl}')`;

  mainTag.classList.add("dimmed-bg");
}
