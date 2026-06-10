/*
  LifeMesh Layer 2 — Cold Chain Monitor Firmware
  Hardware: Arduino Nano 33 BLE Sense (or generic ESP32/Arduino with MPU6050 & DHT22)
  Function:
    - Reads Temperature & Humidity
    - Reads 3-axis Accelerometer for Shock detection
    - Transmits telemetry over Bluetooth Low Energy (BLE) at 2Hz
    - Triggers physical piezo buzzer if thresholds are breached
*/

#include <ArduinoBLE.h>
#include <Wire.h>

// Sensor simulation variables (if real hardware is absent during demo)
bool useSimulation = true;

// BLE Service & Characteristic UUIDs
const char* serviceUUID = "19B10000-E8F2-537E-4F6C-D104768A1214";
const char* telemetryUUID = "19B10001-E8F2-537E-4F6C-D104768A1214";

BLEService coldChainService(serviceUUID);
// Structure: temp(float), hum(float), shock(float), battery(int), alarm(byte)
BLECharacteristic telemetryChar(telemetryUUID, BLERead | BLENotify, 17);

// Hardware Pins
const int BUZZER_PIN = 8;
const int LED_PIN = LED_BUILTIN;

// State
float currentTemp = 4.0;
float currentHum = 65.0;
float currentShock = 1.0;
int batteryPct = 100;
bool alarmActive = false;

// Thresholds
const float MAX_TEMP = 6.0;
const float MIN_TEMP = 2.0;
const float MAX_SHOCK = 2.5;

unsigned long lastUpdate = 0;

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);

  // Initialize BLE
  if (!BLE.begin()) {
    Serial.println("Starting BLE failed!");
    while (1);
  }

  BLE.setLocalName("LifeMesh_Sensor_01");
  BLE.setAdvertisedService(coldChainService);
  coldChainService.addCharacteristic(telemetryChar);
  BLE.addService(coldChainService);

  BLE.advertise();
  Serial.println("LifeMesh BLE Peripheral active. Waiting for connection...");
}

void loop() {
  BLEDevice central = BLE.central();

  if (central) {
    Serial.print("Connected to gateway MAC: ");
    Serial.println(central.address());
    digitalWrite(LED_PIN, HIGH);

    while (central.connected()) {
      if (millis() - lastUpdate > 500) { // 2Hz rate
        lastUpdate = millis();
        readSensors();
        checkThresholds();
        broadcastTelemetry();
        handleBuzzer();
      }
    }

    Serial.println("Gateway disconnected.");
    digitalWrite(LED_PIN, LOW);
  }
}

void readSensors() {
  if (useSimulation) {
    // Add random noise to baseline
    currentTemp += random(-10, 11) / 100.0; // +/- 0.1C
    currentHum += random(-50, 51) / 100.0;  // +/- 0.5%
    currentShock = 1.0 + abs(random(-50, 51) / 100.0); // 1.0G base

    // Simulate battery drain
    if (random(0, 100) > 95 && batteryPct > 0) {
      batteryPct--;
    }

    // Occasionally spike shock for demo purposes if requested via serial
    if (Serial.available()) {
      char cmd = Serial.read();
      if (cmd == 'S') currentShock = 3.8; // Trigger shock
      if (cmd == 'T') currentTemp = 8.5;  // Trigger temp breach
      if (cmd == 'R') { currentTemp = 4.0; currentShock = 1.0; alarmActive = false; } // Reset
    }
  } else {
    // Read from real DHT22 and MPU6050 here
    // currentTemp = dht.readTemperature();
    // ...
  }
}

void checkThresholds() {
  if (currentTemp > MAX_TEMP || currentTemp < MIN_TEMP || currentShock > MAX_SHOCK) {
    alarmActive = true;
  }
}

void broadcastTelemetry() {
  // Pack data: 4 floats + 1 int + 1 byte = 21 bytes (approx)
  // To keep it simple for string parsing on Pi, we'll send a formatted string
  char payload[64];
  sprintf(payload, "T:%.2f H:%.2f S:%.2f B:%d A:%d", 
          currentTemp, currentHum, currentShock, batteryPct, alarmActive ? 1 : 0);
  
  telemetryChar.writeValue((byte*)payload, strlen(payload));
  Serial.println(payload);
}

void handleBuzzer() {
  if (alarmActive) {
    // Beep at 2Hz
    tone(BUZZER_PIN, 2000, 250); 
  } else {
    noTone(BUZZER_PIN);
  }
}
