import React from 'react';

interface WeatherEffectsProps {
  weatherType: string;
  isDarkMode: boolean;
}

const WeatherEffects: React.FC<WeatherEffectsProps> = ({ weatherType, isDarkMode }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Rain Effect */}
      {weatherType === 'Rain' && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="rain-drop"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${0.5 + Math.random() * 0.3}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Thunderstorm Effect */}
      {weatherType === 'Thunderstorm' && (
        <>
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(100)].map((_, i) => (
              <div
                key={i}
                className="rain-drop"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${0.5 + Math.random() * 0.3}s`
                }}
              />
            ))}
          </div>
          <div className="lightning" />
        </>
      )}

      {/* Snow Effect */}
      {weatherType === 'Snow' && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="snow-flake"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WeatherEffects;