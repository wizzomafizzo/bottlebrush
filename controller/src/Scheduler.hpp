#pragma once

struct Schedule
{
    int modifier; // Adjust run time by %
    bool days[7]; // Mon, Tue, Wed... what days to run program each week
    int startTime; // Hour of day to start program
    bool stationEnabled[4];
    bool stationDuration[4]; // Time to run station in minutes
};

