import { Module } from '@nestjs/common';
import { ActivityRecordsService } from './activity-records.service';
import { ActivityRecordsController } from './activity-records.controller';

@Module({
  controllers: [ActivityRecordsController],
  providers: [ActivityRecordsService],
  exports: [ActivityRecordsService],
})
export class ActivityRecordsModule {}