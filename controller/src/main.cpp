#include <Config.hpp>
#include <Sensors.hpp>
#include <Wifi.hpp>
#include <WebSockets.hpp>
#include <Screen.hpp>
#include <Solenoids.hpp>

void setup()
{
    Serial.begin(115200);

    pinMode(SCREEN_WAKE_PIN, INPUT);
    pinMode(A0, INPUT);
    for (int i = 0; i < SOLENOID_COUNT; i++)
    {
        pinMode(SOLENOID_PINS[i], OUTPUT);
    }

    disableAllStations();
    sensorSetup();
    screenSetup();
    wifiSetup();
    webSocketsSetup();

    SCREEN.clearDisplay();
}

void loop()
{
    CLIENT.poll();
    monitorStations();
    sendStatusUpdate();
    powerScreen();
    printStatusScreen();

    if (!CLIENT.available()) {
        // TODO: This could be a bit more graceful
        Serial.println("Lost server connection, attempting reconnect...");
        webSocketsSetup();
    }
}
