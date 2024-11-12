import React, { useState, useEffect } from "react";
import Search from "./components/search/Search";
import CurrentWeather from "./components/current-weather/CurrentWeather";
import { WEATHER_API_KEY, WEATHER_API_URL } from "./api";
import WeatherForecast from "./components/weather-forecast/WeatherForecast";
import "./App.css"; // Import the CSS file containing the loader styles

const App = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);

  const [currentLongitude, setCurrentLongitude] = useState(null);
  const [currentLatitude, setCurrentLatitude] = useState(null);

  // Fetch user location
  useEffect(() => {
    setLoading(true);
    function getUserLocation() {
      return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const latitude = position.coords.latitude;
              const longitude = position.coords.longitude;
              resolve({ latitude, longitude });
            },
            (error) => {
              reject(error);
            }
          );
        } else {
          reject(new Error("Geolocation is not supported by this browser."));
        }
      });
    }

    getUserLocation()
      .then((location) => {
        setCurrentLatitude(location.latitude);
        setCurrentLongitude(location.longitude);
      })
      .catch((error) => {
        console.error("Error:", error.message);
      });
  }, []); // Only run once on mount

  // Fetch weather data when latitude and longitude are set
  useEffect(() => {
    if (currentLatitude && currentLongitude) {
      handleOnSearchChange({ label: "Current Location", value: `${currentLatitude} ${currentLongitude}` });
    }
  }, [currentLatitude, currentLongitude]);

  const handleOnSearchChange = (searchData) => {
    const [lat, long] = searchData.value.split(" ");

    // Set loading to true when starting the fetch
    setLoading(true);

    const currentWeatherFetch = fetch(
      `${WEATHER_API_URL}/weather?lat=${lat}&lon=${long}&appid=${WEATHER_API_KEY}&units=metric`
    );
    const forecastFetch = fetch(
      `${WEATHER_API_URL}/forecast?lat=${lat}&lon=${long}&appid=${WEATHER_API_KEY}&units=metric`
    );

    Promise.all([currentWeatherFetch, forecastFetch])
      .then(async (response) => {
        const weatherResponse = await response[0].json();
        const forecastResponse = await response[1].json();

        setCurrentWeather({ city: searchData.label, ...weatherResponse });
        setForecast({ city: searchData.label, ...forecastResponse });
      })
      .catch((err) => console.log(err))
      .finally(() => {
        // Set loading to false when data fetching is complete
        setLoading(false);
      });
  };

  return (
    <div className="container">
      <Search onSearchChange={handleOnSearchChange} />

      {loading ? (
        <div className="loader-div">
          <div className="loader"></div>
        </div> 
      ) : (
        <>
          {currentWeather && <CurrentWeather data={currentWeather} />}
          {forecast && <WeatherForecast data={forecast} />}
        </>
      )}
    </div>
  );
};

export default App;
