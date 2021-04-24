#pragma once

#include <Config.hpp>
#include <Sensors.hpp>
#include <Solenoids.hpp>

#include <ArduinoWebsockets.h>
#include <ArduinoJson.h>

using namespace websockets;

websockets::WebsocketsClient CLIENT;
unsigned long LAST_STATUS_SENT = 0;

void onMessageCallback(WebsocketsMessage message)
{
    Serial.print("Got Message: ");
    Serial.println(message.data());

    if (message.isText())
    {
        DynamicJsonDocument doc(1024);
        deserializeJson(doc, message.data());
        JsonObject obj = doc.as<JsonObject>();
        if (obj["command"] == 2) {
            enableStation(obj["stationId"]);
        } else if (obj["command"] == 3) {
            disableAllStations();
        }
    }
}

void sendIdentify()
{
    StaticJsonDocument<200> identify;
    identify["command"] = 0;
    identify["role"] = 0;
    String command;
    serializeJson(identify, command);
    CLIENT.send(command);
    Serial.println("Identified as controller");
}

void sendStatusUpdate()
{
    if (millis() - LAST_STATUS_SENT < SEND_STATUS_DELAY) {
        return;
    }
    StaticJsonDocument<300> status;
    status["command"] = 1;
    status["date"] = getDate().timestamp();
    status["pressure"] = getPressure();
    status["temperature"] = getTemperature();
    JsonArray solenoidsStatus = status.createNestedArray("solenoids");
    for (int i = 0; i < SOLENOID_COUNT; i++)
    {
        solenoidsStatus.add(isSolenoidOn(i));
    }
    String command;
    serializeJson(status, command);
    if (CLIENT.available())
    {
        CLIENT.send(command);
        LAST_STATUS_SENT = millis();
    }
}

void onEventsCallback(WebsocketsEvent event, String data)
{
    if (event == WebsocketsEvent::ConnectionOpened)
    {
        Serial.println("Connnection Opened");
    }
    else if (event == WebsocketsEvent::ConnectionClosed)
    {
        Serial.println("Connnection Closed");
    }
    else if (event == WebsocketsEvent::GotPing)
    {
        Serial.println("Got a Ping!");
    }
    else if (event == WebsocketsEvent::GotPong)
    {
        Serial.println("Got a Pong!");
    }
}

void webSocketsSetup()
{
    CLIENT.onMessage(onMessageCallback);
    CLIENT.onEvent(onEventsCallback);
    CLIENT.connect(WEBSOCKETS_HOST, WEBSOCKETS_PORT, WEBSOCKETS_PATH);
    CLIENT.ping();
    sendIdentify();
}
