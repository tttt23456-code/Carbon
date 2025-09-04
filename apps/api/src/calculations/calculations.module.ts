import { Module } from '@nestjs/common';
import { CalculationController } from './calculation.controller';
import { CalculationService } from './calculation.service';
import { CalculatorRegistry } from './calculators/calculator-registry.service';
import { UnitConverterRegistry, EnergyUnitConverter, VolumeUnitConverter, MassUnitConverter, DistanceUnitConverter, CompositeUnitConverter } from './units/unit-converter.service';
import { ElectricityCalculator } from './calculators/electricity.calculator';
import { FuelCombustionCalculator } from './calculators/fuel-combustion.calculator';
import { FlightCalculator } from './calculators/flight.calculator';
import { FreightCalculator } from './calculators/freight.calculator';
import { WasteCalculator } from './calculators/waste.calculator';

@Module({
  controllers: [CalculationController],
  providers: [
    // 单位转换器
    EnergyUnitConverter,
    VolumeUnitConverter,
    MassUnitConverter,
    DistanceUnitConverter,
    CompositeUnitConverter,
    UnitConverterRegistry,
    
    // 计算器
    ElectricityCalculator,
    FuelCombustionCalculator,
    FlightCalculator,
    FreightCalculator,
    WasteCalculator,
    CalculatorRegistry,
    
    // 主服务
    CalculationService,
  ],
  exports: [CalculationService, CalculatorRegistry, UnitConverterRegistry],
})
export class CalculationsModule {}