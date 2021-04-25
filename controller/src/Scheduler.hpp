#pragma once

#include <RTClib.h>
#include <Config.hpp>
#include <Sensors.hpp>
#include <Solenoids.hpp>

#define PROGRAM_OFF -1

struct Program
{
    int running;   // Current active station
    int modifier;  // Adjust run time by %
    bool days[7];  // Sun, Mon, Tue, Wed... what days to run program each week
    int startTime; // Hour of day to start program
    bool stationEnabled[SOLENOID_COUNT - 1];
    int stationDuration[SOLENOID_COUNT - 1]; // Time to run station in minutes
};

struct Program PROGRAM = {
    PROGRAM_OFF,
    100,
    {true, true, false, false, false, true, false},
    5,
    {true, true, true, false},
    {2, 1, 2, 0}};

// Get adjusted run time of a station in seconds
int stationRunTime(int id)
{
    float duration = PROGRAM.stationDuration[id];
    return (duration / 100.0) * PROGRAM.modifier * 60;
}

// Get run time of whole program in seconds
int totalRunTime()
{
    int total = 0;
    for (int i = 0; i < SOLENOID_COUNT - 1; i++)
    {
        if (PROGRAM.stationEnabled[i])
        {
            total += stationRunTime(i);
        }
    }
    return total;
}

// Get start time of program for today
// TODO: Investigate this, test programs start a little bit after this time
DateTime getStartTime()
{
    DateTime now = getDate();
    // return DateTime(now.year(), now.month(), now.day(), PROGRAM.startTime);
    return DateTime(F(__DATE__), F(__TIME__));
}

// Get end time of program for today
DateTime getEndTime()
{
    return getStartTime() + TimeSpan(totalRunTime());
}

// Check if currently in the program scheduled time
bool inScheduledTime()
{
    DateTime now = getDate();

    if (!PROGRAM.days[now.dayOfTheWeek()])
    {
        // Program is off today
        return false;
    }

    return now >= getStartTime() && now <= getEndTime();
}

// Get station scheduled for current time in program
int getScheduledStation()
{
    if (!inScheduledTime())
    {
        return PROGRAM_OFF;
    }

    DateTime now = getDate();
    DateTime start = getStartTime();
    DateTime end;

    for (int i = 0; i < SOLENOID_COUNT - 1; i++)
    {
        end = start + TimeSpan(stationRunTime(i));
        if (now >= start && now <= end)
        {
            if (PROGRAM.stationEnabled[i])
            {
                // Station is running
                return i;
            }
            else
            {
                // In time range but station is disabled
                return PROGRAM_OFF;
            }
        }
        start = end + TimeSpan(1);
    }

    return PROGRAM_OFF;
}

// Update state of solenoids based on program
void checkProgram()
{
    int station = getScheduledStation();
    int stationId = station + 1;

    if (PROGRAM.running >= 0 && station == PROGRAM_OFF)
    {
        disableAllStations();
        PROGRAM.running = PROGRAM_OFF;
        Serial.println("Program ended, disabling all stations");
    }
    else if (station >= 0 && !isStationOn(stationId))
    {
        enableStation(stationId);
        PROGRAM.running = station;
        Serial.print("Starting station from program: ");
        Serial.println(stationId);
    }
}
