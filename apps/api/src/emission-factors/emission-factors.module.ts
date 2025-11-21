import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EmissionFactorsService } from './emission-factors.service';
import { EmissionFactorsController } from './emission-factors.controller';

@Module({
  imports: [JwtModule],
  controllers: [EmissionFactorsController],
  providers: [EmissionFactorsService],
  exports: [EmissionFactorsService],
})
export class EmissionFactorsModule {}