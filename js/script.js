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

const errMessageTitle = document.querySelector(".error-message-title");
const errMessageTxt = document.querySelector(".error-message-txt");
const errMessageImg = document.querySelector(".error-message-img");

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

window.onload = initialize; // Assigning function to window.onload properly

// Event Listener for search button and search input
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

// Fetch API to get data from OpenWeatherAPI
async function getFetchData(endPoint, city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(apiUrl);

    // Check if the response was successful
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Handle network errors
    if (
      error.name === "TypeError" &&
      error.message.includes("Failed to fetch")
    ) {
      showDisplaySection(notFoundSection);
      mainTag.style.display = "none";

      console.error("Network error:", error);

      // set error message
      errMessageImg.src = `assets/message/network_error.png`;
      errMessageTitle.textContent = "Network Error";
      errMessageTxt.textContent = "Please check your internet connection.";
      return;
    }

    // Handle API request errors
    else if (error.message.includes("API request failed")) {
      showDisplaySection(notFoundSection);
      mainTag.style.display = "none";

      console.error("API request error:", error);

      // set error message
      errMessageTitle.textContent = "Not  Found";
      errMessageTxt.textContent = "sorry...We couldn't find your search";
      return;
    }

    // Handle other errors
    else {
      showDisplaySection(notFoundSection);
      mainTag.style.display = "none";

      console.error("Unknown error:", error);

      // set error message
      errMessageImg.src = `assets/message/unknown_error.png`;
      errMessageTitle.textContent = "Something Went Wrong";
      errMessageTxt.textContent =
        "An unknown error occurred. Please try again later..";
      return;
    }
  }
}

// Get weather icon based on weather condition
function getWeatherIcon(id) {
  if (id <= 232) return "thunderstorm.svg";
  if (id <= 321) return "drizzle.svg";
  if (id <= 531) return "rain.svg";
  if (id <= 622) return "snow.svg";
  if (id <= 781) return "atmosphere.svg";
  if (id <= 800) return "clear.svg";
  return "cloudy.svg";
}

// Get current date
function getCurrentDate() {
  const currentDate = new Date();
  const options = {
    weekday: "short",
    day: "2-digit",
    month: "short"
  };

  return currentDate.toLocaleDateString("en-GB", options);
}

// Get time
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

// Update fetched weather information for viewing
async function updateWeatherInfo(city) {
  // Show loader before fetching data
  showLoader();

  const weatherData = await getFetchData("weather", city);

  // Hide loader after data is fetched
  hideLoader();

  // Show not found message
  if (weatherData.cod != 200) {
    showDisplaySection(notFoundSection);
    mainTag.style.display = "none";
    return;
  }

  // Set main back to view
  mainTag.style.display = "block";

  // Get weather data
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
  weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`;

  await updateForecastsInfo(city);

  console.log(weatherData); // Console log data for debugging

  showDisplaySection(weatherInfoSection);
}

// Get 5-days weather forecast data
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
              <img src="assets/weather/${getWeatherIcon(
                id
              )}" class="forecast-item-img">
              <h5 class="forecast-item-temp">${Math.round(temp)}°C</h5>
              <p class="forecast-item-condition">${weatherCondition}</p>
          </div>
      `;

  forecastItemsContainer.insertAdjacentHTML("beforeend", forecastItem);
}

// Display weather information
function showDisplaySection(section) {
  [weatherInfoSection, notFoundSection].forEach(
    sec => (sec.style.display = "none")
  );

  section.style.display = "block";
}

// Functions to show and hide the loader
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
