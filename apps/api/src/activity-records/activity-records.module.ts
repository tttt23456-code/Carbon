import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ActivityRecordsService } from './activity-records.service';
import { ActivityRecordsController } from './activity-records.controller';

@Module({
  imports: [JwtModule],
  controllers: [ActivityRecordsController],
  providers: [ActivityRecordsService],
  exports: [ActivityRecordsService],
})
export class ActivityRecordsModule {}