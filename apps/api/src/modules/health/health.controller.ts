import { Controller, Get } from '@nestjs/common';
import type { AppHealth } from '@ecommerce/types';

@Controller('health')
export class HealthController {
  @Get()
  getHealth(): AppHealth {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'api'
    };
  }
}
