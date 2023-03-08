import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';

import { IResponse } from '@shared/interceptors/request-response.interceptor';
import { LoggerService } from '@shared/modules/loggers/logger.service';

@Catch()
export class UnknownExceptionsFilter implements ExceptionFilter {
    constructor(private readonly loggingService: LoggerService) {}

    private logger = this.loggingService.getLogger('unknown-exception');

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        this.logger.error(exception);

        const defaultResponse: IResponse<any> = {
            data: null,
            validatorErrors: [],
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            message: typeof exception === 'object' && exception?.message ? exception.message : 'unknown exception',
            success: false,
        };
        response.status(defaultResponse.statusCode).json(defaultResponse);
    }
}
