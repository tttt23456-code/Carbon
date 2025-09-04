import { Test, TestingModule } from '@nestjs/testing';
import { ElectricityCalculator } from '../electricity.calculator';
import { UnitConverterRegistry } from '../../units/unit-converter.service';
import { NormalizedInput, EmissionFactor, CalculationResult } from '../../interfaces/calculation.interface';

describe('ElectricityCalculator', () => {
  let calculator: ElectricityCalculator;
  let unitConverter: UnitConverterRegistry;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ElectricityCalculator,
        UnitConverterRegistry,
      ],
    }).compile();

    calculator = module.get<ElectricityCalculator>(ElectricityCalculator);
    unitConverter = module.get<UnitConverterRegistry>(UnitConverterRegistry);
  });

  describe('getSupportedActivityTypes', () => {
    it('should return electricity activity type', () => {
      const types = calculator.getSupportedActivityTypes();
      expect(types).toContain('electricity');
    });
  });

  describe('calculate', () => {
    const mockEmissionFactor: EmissionFactor = {
      id: '1',
      activityType: 'electricity',
      region: 'CN',
      year: 2023,
      factorValue: 0.5810, // kg CO2e/kWh
      factorUnit: 'kg CO2e/kWh',
      gas: 'CO2',
      gwp: 1,
      source: 'CHINA_GRID',
      reference: '中国电网平均排放因子',
    };

    it('should calculate location-based emissions correctly', async () => {
      const input: NormalizedInput = {
        activityType: 'electricity',
        amount: 1000,
        unit: 'kWh',
        normalizedAmount: 1000, // kWh
        normalizedUnit: 'kWh',
        metadata: {
          method: 'location_based',
          region: 'CN',
        },
      };

      const result: CalculationResult = await calculator.calculate(input, mockEmissionFactor);

      expect(result.tCO2e).toBe(0.581); // 1000 * 0.5810 / 1000
      expect(result.method).toBe('location_based');
      expect(result.dataQuality).toBe('calculated');
    });

    it('should calculate market-based emissions correctly', async () => {
      const input: NormalizedInput = {
        activityType: 'electricity',
        amount: 1000,
        unit: 'kWh',
        normalizedAmount: 1000, // kWh
        normalizedUnit: 'kWh',
        metadata: {
          method: 'market_based',
          region: 'CN',
        },
      };

      const result: CalculationResult = await calculator.calculate(input, mockEmissionFactor);

      expect(result.tCO2e).toBeGreaterThan(0);
      expect(result.method).toBe('market_based');
    });

    it('should handle zero amount correctly', async () => {
      const input: NormalizedInput = {
        activityType: 'electricity',
        amount: 0,
        unit: 'kWh',
        normalizedAmount: 0,
        normalizedUnit: 'kWh',
        metadata: {
          method: 'location_based',
        },
      };

      const result: CalculationResult = await calculator.calculate(input, mockEmissionFactor);

      expect(result.tCO2e).toBe(0);
    });

    it('should default to location-based method when not specified', async () => {
      const input: NormalizedInput = {
        activityType: 'electricity',
        amount: 1000,
        unit: 'kWh',
        normalizedAmount: 1000,
        normalizedUnit: 'kWh',
        metadata: {},
      };

      const result: CalculationResult = await calculator.calculate(input, mockEmissionFactor);

      expect(result.method).toBe('location_based');
    });
  });

  describe('validate', () => {
    it('should accept valid electricity input', async () => {
      const input = {
        activityType: 'electricity',
        amount: 1000,
        unit: 'kWh',
        metadata: {},
      };

      const result = await calculator.validate(input);
      expect(result.activityType).toBe('electricity');
      expect(result.normalizedAmount).toBe(1000);
    });

    it('should reject negative amount', async () => {
      const input = {
        activityType: 'electricity',
        amount: -1000,
        unit: 'kWh',
        metadata: {},
      };

      await expect(calculator.validate(input)).rejects.toThrow();
    });
  });
});