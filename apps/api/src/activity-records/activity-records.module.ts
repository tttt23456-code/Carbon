import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ActivityRecordsService } from './activity-records.service';
import { ActivityRecordsController } from './activity-records.controller';
import { DataQualityService } from './data-quality.service';

@Module({
  imports: [JwtModule],
  controllers: [ActivityRecordsController],
  providers: [ActivityRecordsService, DataQualityService],
  exports: [ActivityRecordsService, DataQualityService],
})
export class ActivityRecordsModule {}