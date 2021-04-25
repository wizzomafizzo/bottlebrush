import * as dotenv from "dotenv";
import axios from "axios";
import { format } from "date-fns";

dotenv.config();

const apiKey = process.env.WEATHER_API_KEY;
const apiUrl = `https://api.willyweather.com.au/v2/${apiKey}`;

const locationId = 16010; // Beckenham

interface WWLocation {
    id: number;
    name: string;
    region: string;
    state: string;
    postcode: string;
    timeZone: string;
    lat: number;
    lng: number;
    typeId: number;
}

interface WWForecastWeather {
    days: {
        dateTime: string;
        entries: {
            dateTime: string;
            precisCode: string;
            precis: string;
            precisOverlayCode: string;
            night: boolean;
            min: number;
            max: number;
        }[];
    }[];
    units: {
        temperature: string;
    };
    issueDateTime: string;
}

interface WWForecastRainfall {
    days: {
        dateTime: string;
        entries: {
            dateTime: string;
            startRange: number;
            endRange: number;
            rangeDivide: string;
            rangeCode: string;
            probability: number;
        }[];
    }[];
}

interface WWForecastRainfallProbability {
    days: {
        dateTime: string;
        entries: {
            dateTime: string;
            probability: number;
        }[];
    }[];
    unit: {
        percentage: string;
    };
    issueDateTime: string;
    carousel: {
        size: number;
        start: number;
    };
}

interface WWForecastTemperature {
    days: {
        dateTime: string;
        entries: {
            dateTime: string;
            temperature: number;
        }[];
    }[];
    units: {
        temperature: string;
    };
    issueDateTime: string;
    carousel: {
        size: number;
        start: number;
    };
}

interface WWResponse {
    location: WWLocation;
}

interface WWForecasts extends WWResponse {
    forecasts: {
        weather: WWForecastWeather;
        rainfall: WWForecastRainfall;
        rainfallProbability: WWForecastRainfallProbability;
        temperature: WWForecastTemperature;
    };
}

export default class Weather {
    startDate: string;
    days: number;
    constructor() {
        this.startDate = format(new Date(), "yyyy-MM-dd");
        this.days = 7;
    }
    async getLocation(): Promise<WWLocation> {
        const url = `${apiUrl}/locations/${locationId}.json`;
        const response = await axios.get(url);
        return response.data;
    }
    async getForecast(): Promise<WWForecasts> {
        const url = `${apiUrl}/locations/${locationId}/weather.json?forecasts=weather,rainfall,rainfallprobability,temperature&days=${this.days}&startDate=${this.startDate}`;
        const response = await axios.get(url);
        return response.data;
    }
}
