#pragma once

#include <EEPROM.h>
#include <Config.hpp>
#include <Scheduler.hpp>

#define EEPROM_START 0
#define CONFIG_HEADER 12345

struct BBConfig
{
    int header;
    int maxRunTime;
    int modifier;
    bool days[7];
    int startTime;
    bool stationEnabled[SOLENOID_COUNT - 1];
    int stationDuration[SOLENOID_COUNT - 1];
} CONFIG;

// Copy active program to config
void getProgram()
{
    CONFIG.modifier = PROGRAM.modifier;
    for (int i = 0; i < 7; i++)
    {
        CONFIG.days[i] = PROGRAM.days[i];
    }
    CONFIG.startTime = PROGRAM.startTime;
    for (int i = 0; i < SOLENOID_COUNT - 1; i++)
    {
        CONFIG.stationEnabled[i] = PROGRAM.stationEnabled[i];
    }
    for (int i = 0; i < SOLENOID_COUNT - 1; i++)
    {
        CONFIG.stationDuration[i] = PROGRAM.stationDuration[i];
    }
}

void putProgram()
{
    PROGRAM.modifier = CONFIG.modifier;
    for (int i = 0; i < 7; i++)
    {
        PROGRAM.days[i] = CONFIG.days[i];
    }
    PROGRAM.startTime = CONFIG.startTime;
    for (int i = 0; i < SOLENOID_COUNT - 1; i++)
    {
        PROGRAM.stationEnabled[i] = CONFIG.stationEnabled[i];
    }
    for (int i = 0; i < SOLENOID_COUNT - 1; i++)
    {
        PROGRAM.stationDuration[i] = CONFIG.stationDuration[i];
    }
}

void saveDefaultConfig()
{
    CONFIG.header = CONFIG_HEADER;
    CONFIG.maxRunTime = STATION_MAX_RUN;
    getProgram();
    EEPROM.put(EEPROM_START, CONFIG);
    EEPROM.commit();
}

void loadConfig()
{
    EEPROM.get(EEPROM_START, CONFIG);
    Serial.println(CONFIG.header);
    if (CONFIG.header != CONFIG_HEADER)
    {
        // First time setup
        Serial.println("Invalid header, setting storage to defaults");
        saveDefaultConfig();
    }
    putProgram();
    Serial.println("Loaded config");
}

void saveConfig()
{
    getProgram();
    EEPROM.put(EEPROM_START, CONFIG);
    EEPROM.commit();
    Serial.println("Saved config");
}

void setupStorage()
{
    EEPROM.begin(512);
    loadConfig();
}
