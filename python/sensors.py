from dataclasses import dataclass


@dataclass(frozen=True)
class SensorDefinition:
    sensor_id: str
    zone: str
    metric: str
    unit: str
    normal_min: float
    normal_max: float


SENSORS: list[SensorDefinition] = [
    SensorDefinition("CAVE_01_TEMP", "cave_affinage_1", "temperature", "celsius", 10, 14),
    SensorDefinition("CAVE_01_HUM", "cave_affinage_1", "humidity", "percent", 85, 95),
    SensorDefinition("CAVE_02_TEMP", "cave_affinage_2", "temperature", "celsius", 10, 14),
    SensorDefinition("CAVE_02_HUM", "cave_affinage_2", "humidity", "percent", 85, 95),
    SensorDefinition("FRIGO_LAIT_TEMP", "frigo_lait", "temperature", "celsius", 2, 4),
    SensorDefinition("LABO_TEMP", "laboratoire", "temperature", "celsius", 16, 22),
]

SENSOR_BY_ID = {sensor.sensor_id: sensor for sensor in SENSORS}
