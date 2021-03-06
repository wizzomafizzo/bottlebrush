#pragma once

#include <Arduino.h>

#define WIFI_SSID "YOUR_SSID"
#define WIFI_PASSWORD "YOUR_PW"

#define WEBSOCKETS_HOST "YOUR_SERVER"
#define WEBSOCKETS_PORT 8999
#define WEBSOCKETS_PATH "/"

#define STATION_MAX_RUN 30000
#define SOLENOID_BOOT_TIME 100
#define SOLENOID_BOOT_FREQ 1000
#define SOLENOID_HOLD_FREQ 300
#define SOLENOID_0_PIN D4
#define SOLENOID_1_PIN D5
#define SOLENOID_2_PIN D6
#define SOLENOID_3_PIN D7
#define SOLENOID_4_PIN D8
#define SOLENOID_COUNT 5
const uint8_t SOLENOID_PINS[SOLENOID_COUNT] = {
    SOLENOID_0_PIN,
    SOLENOID_1_PIN,
    SOLENOID_2_PIN,
    SOLENOID_3_PIN,
    SOLENOID_4_PIN};

#define SCREEN_WAKE_PIN D0
#define SCREEN_ON_TIME 10000
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

#define SEND_STATUS_DELAY 1000
