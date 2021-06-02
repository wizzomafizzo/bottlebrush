#pragma once

#include <Wire.h>
#include <SPI.h>
#include <RTClib.h>

RTC_DS1307 RTC;

void clockSetup()
{
    
    RTC.begin();

    if (!RTC.isrunning())
    {
        Serial.println("Resetting RTC time");
        RTC.adjust(DateTime(F(__DATE__), F(__TIME__)));
    }

    Serial.println(RTC.now().timestamp());
}

DateTime getDate()
{
    return RTC.now();
}
