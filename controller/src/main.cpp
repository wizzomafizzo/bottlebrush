#include <Config.hpp>
#include <Clock.hpp>
#include <Wifi.hpp>
#include <WebSockets.hpp>
#include <Solenoids.hpp>
#include <Scheduler.hpp>
#include <Storage.hpp>

void setup()
{
    Serial.begin(115200);

    for (int i = 0; i < SOLENOID_COUNT; i++)
    {
        pinMode(SOLENOID_PINS[i], OUTPUT);
    }

    disableAllStations();
    clockSetup();
    wifiSetup();
    webSocketsSetup();
    setupStorage();
}

void loop()
{
    CLIENT.poll();
    checkProgram();
    monitorStations();
    sendStatusUpdate();

    if (!CLIENT.available()) {
        // TODO: This could be a bit more graceful
        Serial.println("Lost server connection, attempting reconnect...");
        webSocketsSetup();
    }
}
