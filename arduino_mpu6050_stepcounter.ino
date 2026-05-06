#include <MPU6050.h>
#include <Wire.h>

MPU6050 mpu;
int stepCount = 0;
float prevMagnitude = 0;
bool stepDetected = false;
unsigned long lastStepTime = 0;

void setup() {
  Serial.begin(9600);
  Wire.begin();
  
  // Initialize MPU6050
  mpu.initialize();
  
  if (mpu.testConnection()) {
    Serial.println("MPU6050 connected!");
  } else {
    Serial.println("MPU6050 connection failed");
    while(1);
  }
  
  delay(1000);
}

void loop() {
  int16_t ax, ay, az;
  mpu.getAcceleration(&ax, &ay, &az);
  
  // Calculate magnitude of acceleration
  float magnitude = sqrt(ax*ax + ay*ay + az*az) / 16384.0;
  
  // Step detection (threshold-based)
  if (magnitude > 1.3 && prevMagnitude <= 1.3 && !stepDetected) {
    // Debounce - prevent multiple counts for one step
    if (millis() - lastStepTime > 300) {
      stepCount++;
      stepDetected = true;
      lastStepTime = millis();
    }
  }
  
  // Reset step detection flag when magnitude drops
  if (magnitude < 1.1) {
    stepDetected = false;
  }
  
  // Send data in format: MOV:x|HR:x|CO:x|STP:x
  Serial.print("MOV:5|HR:86|CO:40|STP:");
  Serial.println(stepCount);
  
  prevMagnitude = magnitude;
  
  delay(100); // 10Hz update rate
}
