import { Body, Controller, Post } from '@nestjs/common';
import { TrackingService } from './tracking.service';

@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) { }
  @Post()
  RecevieLog(@Body() dto) {

  }
}
