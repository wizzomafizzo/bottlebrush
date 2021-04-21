#pragma once

#include <RTClib.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BMP085_U.h>

Adafruit_BMP085_Unified BMP = Adafruit_BMP085_Unified(10001);
RTC_DS1307 RTC;

void sensorSetup()
{
    RTC.begin();

    if (!RTC.isrunning())
    {
        Serial.println("Resetting RTC time");
        RTC.adjust(DateTime(F(__DATE__), F(__TIME__)));
    }

    BMP.begin();
}

DateTime getDate()
{
    return RTC.now();
}

float getPressure()
{
    sensors_event_t event;
    BMP.getEvent(&event);
    return event.pressure;
}

float getTemperature()
{
    float temperature;
    BMP.getTemperature(&temperature);
    return temperature;
}
