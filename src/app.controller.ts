import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
@ApiTags('테스트')
@Controller()
export class AppController {
  @ApiOperation({ summary: '상태 체크' })
  @Get()
  getHello(): string {
    return 'Working! 06-20';
  }

  @ApiOperation({ summary: 'Slack 500 에러' })
  @Get('/test/error')
  getTestError(): string {
    throw new HttpException(
      '500 server error test',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
