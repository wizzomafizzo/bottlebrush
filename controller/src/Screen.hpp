#pragma once

#include <Config.hpp>
#include <Sensors.hpp>
#include <Solenoids.hpp>
#include <Wifi.hpp>
#include <WebSockets.hpp>

#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 SCREEN(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
unsigned long SCREEN_PUSHED = 0;

void sleepScreen()
{
    SCREEN.ssd1306_command(SSD1306_DISPLAYOFF);
}

void wakeScreen()
{
    SCREEN.ssd1306_command(SSD1306_DISPLAYON);
}

void powerScreen()
{
    unsigned long currentMillis = millis();

    if (digitalRead(SCREEN_WAKE_PIN) == HIGH)
    {
        wakeScreen();
        SCREEN_PUSHED = currentMillis;
    }

    if (currentMillis - SCREEN_PUSHED > SCREEN_ON_TIME)
    {
        sleepScreen();
    }
}

void screenSetup()
{
    SCREEN.begin(SSD1306_SWITCHCAPVCC, 0x3C);
    SCREEN.display();
    SCREEN_PUSHED = millis();
}

void printStatusScreen()
{
    DateTime now = getDate();
    float pressure = getPressure();
    float temperature = getTemperature();

    SCREEN.clearDisplay();

    SCREEN.setTextSize(1);
    SCREEN.setTextColor(WHITE);
    SCREEN.setCursor(0, 0);

    // Date
    char dateBuffer[12];
    sprintf(dateBuffer, "%02u/%02u/%04u ", now.day(), now.month(), now.year());
    SCREEN.print(dateBuffer);
    sprintf(dateBuffer, "%02u:%02u:%02u", now.twelveHour(), now.minute(), now.second());
    SCREEN.print(dateBuffer);
    if (now.isPM())
    {
        SCREEN.print("PM");
    }
    else
    {
        SCREEN.print("AM");
    }
    SCREEN.println();
    SCREEN.println();

    // Temperature
    SCREEN.print("Temp: ");
    SCREEN.print(temperature);
    SCREEN.print(" C");
    SCREEN.println();

    // Pressure
    SCREEN.print("Pres: ");
    SCREEN.print(pressure);
    SCREEN.print(" hPa");
    SCREEN.println();

    // IP
    SCREEN.print("IP:   ");
    SCREEN.print(WiFi.localIP());
    SCREEN.println();

    // WebSocket connection
    SCREEN.print("Conn: ");
    if (CLIENT.available())
    {
        SCREEN.print("Yes");
    }
    else
    {
        SCREEN.print("No");
    }
    SCREEN.println();

    SCREEN.println();

    // Solenoids
    for (int i = 0; i < SOLENOID_COUNT; i++)
    {
        if (i == 0) {
            SCREEN.print("M:");
        }
        else
        {
            SCREEN.print(i);
            SCREEN.print(":");
        }
        if (isSolenoidOn(i)) {
            SCREEN.print("Y");
        }
        else
        {
            SCREEN.print("N");
        }
        SCREEN.print(" ");
    }

    SCREEN.display();
}