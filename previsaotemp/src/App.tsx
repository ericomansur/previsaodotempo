import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, MapPin, Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, Clock } from 'lucide-react';
import WeatherEffects from './WeatherEffects';

const API_KEY = 'ac9c277db31ef8de17e35ee0899f0c00';
const BASE_URL = 'https://api.openweathermap.org';

interface WeatherData {
  main: {
    temp: number;
    humidity: number;
    feels_like: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
  name: string;
  dt: number;
  sys: {
    sunrise: number;
    sunset: number;
  };
}

interface ForecastData {
  list: Array<{
    dt_txt: string;
    main: {
      temp: number;
    };
    weather: Array<{
      main: string;
    }>;
  }>;
}

interface LocationSuggestion {
  name: string;
  state: string;
  country: string;
  lat: number;
  lon: number;
}

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [clima, setClima] = useState<WeatherData | null>(null);
  const [previsao, setPrevisao] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'Clear':
        return <Sun className="w-12 h-12 text-yellow-500" />;
      case 'Clouds':
        return <Cloud className="w-12 h-12 text-gray-500" />;
      case 'Rain':
        return <CloudRain className="w-12 h-12 text-blue-500" />;
      case 'Snow':
        return <CloudSnow className="w-12 h-12 text-white" />;
      case 'Thunderstorm':
        return <CloudLightning className="w-12 h-12 text-yellow-400" />;
      default:
        return <Cloud className="w-12 h-12 text-gray-500" />;
    }
  };

  const fetchSuggestions = async (value: string) => {
    if (value.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get(
        `${BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(value)}&limit=5&appid=${API_KEY}`,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
      setSuggestions(response.data);
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
      setSuggestions([]);
      setErro('Erro ao buscar sugestões. Por favor, tente novamente.');
    }
  };

  const handleSearch = async (lat: number, lon: number) => {
    setLoading(true);
    setErro('');
    setSuggestions([]);
    setSearchTerm('');

    try {
      const [climaRes, previsaoRes] = await Promise.all([
        axios.get(`${BASE_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }),
        axios.get(`${BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
      ]);

      setClima(climaRes.data);
      setPrevisao(previsaoRes.data);
    } catch (error) {
      setErro('Erro ao buscar dados do clima. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm) {
        fetchSuggestions(searchTerm);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            handleSearch(latitude, longitude);
          } catch (error) {
            setErro('Erro ao obter localização atual.');
          }
        },
        (error) => {
          setErro('Erro ao obter localização. Por favor, permita o acesso à localização ou busque manualmente.');
        }
      );
    }
  }, []);

  // Update current time and check for dark mode
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      if (clima) {
        const sunriseTime = new Date(clima.sys.sunrise * 1000);
        const sunsetTime = new Date(clima.sys.sunset * 1000);
        setIsDarkMode(now < sunriseTime || now > sunsetTime);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [clima]);

  const formatLocationName = (location: LocationSuggestion) => {
    if (location.state) {
      return `${location.name} - ${location.state}, ${location.country}`;
    }
    return `${location.name}, ${location.country}`;
  };

  const getBackgroundClass = () => {
    if (isDarkMode) {
      return 'bg-gradient-to-br from-gray-900 to-gray-800 text-white';
    }
    return 'bg-gradient-to-br from-amber-100 to-orange-200';
  };

  const getCardClass = () => {
    if (isDarkMode) {
      return 'bg-gray-800 text-white';
    }
    return 'bg-white';
  };

  return (
    <div className={`min-h-screen theme-transition ${getBackgroundClass()}`}>
      {clima && (
        <WeatherEffects
          weatherType={clima.weather[0].main}
          isDarkMode={isDarkMode}
        />
      )}
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-amber-800'}`}>
              Previsão do Tempo
            </h1>
            <div className="flex items-center gap-2">
              <Clock className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                {currentTime.toLocaleTimeString('pt-BR')}
              </span>
            </div>
          </div>
          
          <div className="relative mb-8">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite o nome da cidade..."
                className={`flex-1 p-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'border-amber-300 focus:ring-amber-500'
                } focus:outline-none focus:ring-2`}
              />
              <button
                className="bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors"
                disabled={loading}
              >
                {loading ? 'Buscando...' : <Search className="w-6 h-6" />}
              </button>
            </div>
            
            {suggestions.length > 0 && (
              <div className={`absolute w-full mt-1 rounded-lg shadow-lg border z-10 ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-amber-200'
              }`}>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.lat}-${suggestion.lon}-${index}`}
                    className={`w-full text-left px-4 py-2 first:rounded-t-lg last:rounded-b-lg ${
                      isDarkMode
                        ? 'hover:bg-gray-700'
                        : 'hover:bg-amber-50'
                    } transition-colors`}
                    onClick={() => handleSearch(suggestion.lat, suggestion.lon)}
                  >
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-amber-500" />
                      {formatLocationName(suggestion)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {erro && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {erro}
            </div>
          )}

          {clima && (
            <div className={`${getCardClass()} rounded-xl shadow-lg p-6 mb-8 transform hover:scale-102 transition-transform`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-semibold flex items-center">
                    <MapPin className="w-6 h-6 mr-2 text-amber-500" />
                    {clima.name}
                  </h2>
                  <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {clima.weather[0].description}
                  </p>
                </div>
                {getWeatherIcon(clima.weather[0].main)}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className={`text-center p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-amber-50'}`}>
                  <p className="text-4xl font-bold text-amber-600">
                    {Math.round(clima.main.temp)}°C
                  </p>
                  <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                    Temperatura
                  </p>
                </div>
                <div className={`text-center p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-amber-50'}`}>
                  <div className="flex justify-center mb-2">
                    <Droplets className="w-6 h-6 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {clima.main.humidity}%
                  </p>
                  <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                    Umidade
                  </p>
                </div>
                <div className={`text-center p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-amber-50'}`}>
                  <div className="flex justify-center mb-2">
                    <Wind className="w-6 h-6 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold text-amber-600">
                    {Math.round(clima.main.feels_like)}°C
                  </p>
                  <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                    Sensação
                  </p>
                </div>
              </div>
            </div>
          )}

          {previsao && (
            <div className={`${getCardClass()} rounded-xl shadow-lg p-6`}>
              <h3 className="text-xl font-semibold mb-4">Próximos Dias</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {previsao.list
                  .filter((item, index) => index % 8 === 0)
                  .slice(0, 4)
                  .map((item, index) => (
                    <div
                      key={index}
                      className={`text-center p-4 rounded-lg ${
                        isDarkMode ? 'bg-gray-700' : 'bg-amber-50'
                      }`}
                    >
                      <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                        {new Date(item.dt_txt).toLocaleDateString('pt-BR', { weekday: 'short' })}
                      </p>
                      {getWeatherIcon(item.weather[0].main)}
                      <p className="text-2xl font-bold text-amber-600 mt-2">
                        {Math.round(item.main.temp)}°C
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <footer className={`text-center mt-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <p>Desenvolvido e criado por Eric Mansur</p>
          <p className="text-sm mt-1">Dados fornecidos por OpenWeatherMap API</p>
        </footer>
      </div>
    </div>
  );
}

export default App;