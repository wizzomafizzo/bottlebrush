#pragma once

#include <Config.hpp>

#include <Arduino.h>

bool SOLENOIDS[SOLENOID_COUNT] = {false, false, false, false, false};
bool STATIONS[SOLENOID_COUNT - 1] = {false, false, false, false};
unsigned long STATION_START = 0;

void disableAllSolenoids()
{
    for (int i = 0; i < SOLENOID_COUNT; i++)
    {
        SOLENOIDS[i] = false;
        analogWrite(SOLENOID_PINS[i], 0);
    }
    Serial.println("Disabled all solenoids");
}

void powerSolenoid(int id)
{
    analogWrite(SOLENOID_PINS[id], SOLENOID_BOOT_FREQ);
    delay(SOLENOID_BOOT_TIME);
    analogWrite(SOLENOID_PINS[id], SOLENOID_HOLD_FREQ);
}

void enableSolenoid(int id)
{
    if (SOLENOIDS[id]) {
        Serial.print("Solenoid ");
        Serial.print(id);
        Serial.println(" already enabled");
        return;
    }

    disableAllSolenoids();

    // Main solenoid
    SOLENOIDS[0] = true;
    powerSolenoid(0);
    // Station solenoid
    SOLENOIDS[id] = true;
    powerSolenoid(id);

    Serial.print("Enabled main solenoid and solenoid ");
    Serial.println(id);
}

void disableAllStations()
{
    for (int i = 0; i < SOLENOID_COUNT - 1; i++)
    {
        STATIONS[i] = false;
    }
    STATION_START = 0;
    disableAllSolenoids();
    Serial.println("Disabled all stations");
}

void enableStation(int id)
{
    if (id < 1 || id > SOLENOID_COUNT)
    {
        Serial.print("Station ID is out of range: ");
        Serial.println(id);
        return;
    }
    disableAllStations();
    STATIONS[id - 1] = true;
    STATION_START = millis();
    enableSolenoid(id);
    Serial.print("Enabled station ");
    Serial.println(id);
}

void monitorStations()
{
    if (millis() - STATION_START > STATION_MAX_RUN) {
        bool solenoidOn = false;
        for (int i = 0; i < SOLENOID_COUNT; i++)
        {
            if (SOLENOIDS[i]) {
                solenoidOn = true;
            }
        }
        if (solenoidOn) {
            disableAllStations();
        }
    }
}

bool isSolenoidOn(int id)
{
    return SOLENOIDS[id];
}

bool isStationOn(int id)
{
    return STATIONS[id - 1];
}
