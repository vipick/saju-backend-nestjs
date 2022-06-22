import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
const slack = require('../slack/slack');
import * as moment from 'moment';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const err = exception.getResponse() as
      | { message: any; statusCode: number }
      | { error: string; statusCode: 400; message: string[] }
      | { error: string; statusCode: 404; message: string[] }; //class-validator

    let message = null;
    if (typeof err !== 'string') {
      message = status === 500 ? '서버 에러' : err.message;
    } else {
      message = err;
    }

    //prod에서 500에러인 경우 slack 알림
    if (process.env.NODE_ENV !== 'prod') {
      let color = null;
      let errorType = null;
      let errorMessage = message;
      if (status === 500) {
        color = '#ff0000';
        errorType = '서버 에러!';
        errorMessage = err;

        const request = ctx.getRequest<Request>();
        slack.slackMessage(
          color,
          errorType,
          `${status} ${request.url}, ${JSON.stringify(
            errorMessage,
          )}:${JSON.stringify(request.body)}`,
          moment().unix(),
        );
      }
    }

    response.status(status).json({
      statusCode: status,
      message: message,
    });
  }
}
