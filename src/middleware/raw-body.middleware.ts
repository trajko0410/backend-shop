import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as express from 'express';

@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Disable body parsing (use express.raw() to capture raw body)
    express.raw({ type: '*/*', limit: '10mb' })(req, res, next);
  }
}
