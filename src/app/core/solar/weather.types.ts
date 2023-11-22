export interface OpenWeatherWeatherEntity {
    id: number;
    main: string;
    description: string;
    icon: string;
}

export interface OpenWeatherCurrent {
    clouds?: number;
    dew_points?: number;
    dt?: number;
    feels_like?: number;
    humidity?: number;
    rain?: any;
    sunrise?: number;
    sunset?: number;
    temp?: number;
    uvi?: number;
    visibility?: number;
    weather?: OpenWeatherWeatherEntity[];
    wind_deg?: number;
    wind_gust?: number;
    wind_speed?: number;
}

export interface OpenWeatherFeelsLikeDaily {
    day: number;
    eve: number;
    morn: number;
    night: number;
}

export interface OpenWeatherTemperatureDaily {
    day: number;
    eve: number;
    max: number;
    min: number;
    morn: number;
    night: number;
}

export interface OpenWeatherDaily {
    clouds: number;
    dew_points: number;
    dt: number;
    feels_like: OpenWeatherFeelsLikeDaily;
    humidity: number;
    moon_phase: number;
    moonrise: number;
    moonset: number;
    pop: number;
    pressure: number;
    rain: number;
    sunrise: number;
    sunset: number;
    temp: OpenWeatherTemperatureDaily;
    uvi: number;
    weather: [OpenWeatherWeatherEntity];
    wind_deg: number;
    wind_gust: number;
    wind_speed: number;
}

export interface OpenWeatherHourly {
    clouds: number;
    dew_point: number;
    dt: number;
    feels_like: number;
    humidity: number;
    pop: number;
    pressure: number;
    rain: any;
    temp: number;
    uvi: number;
    visibility: number;
    weather: [OpenWeatherWeatherEntity];
    wind_deg: number;
    wind_gust: number;
    wind_speed: number;
}

export interface OpenWeatherMinutely {
    dt: number;
    precipitation: number;
}

export interface OpenWeatherOneCall {
    current: OpenWeatherCurrent;
    daily: [OpenWeatherDaily];
    hourly: [OpenWeatherHourly];
    lat: number;
    lon: number;
    minutely: [OpenWeatherMinutely];
    timezone: string;
    timezone_offset: number;
}

export interface Weather {
    lat?: number;
    lon?: number;
    timezone?: string;
    timezone_offset?: number;
    current?: OpenWeatherCurrent;
    minutely?: [OpenWeatherMinutely];
    hourly?: [OpenWeatherHourly];
}
