import {
  Body,
  Controller,
  Post,
  UseInterceptors,
  Headers,
  UnauthorizedException,
  Req,
  Res,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CheckOutService } from './provider/checkout.service';
import { CheckOutDto } from './dto/checkout.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkOutService: CheckOutService) {}

  @Roles('Admin', 'User', 'Public')
  @Post('')
  @UseInterceptors(AnyFilesInterceptor())
  public checkOut(@Body() checkOutDto: CheckOutDto) {
    return this.checkOutService.checkOut(checkOutDto);
  }

  @Post('webhooks/stripe')
  public async handleStripeWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    console.log('Webhook hit');
    try {
      await this.checkOutService.handleStripeWebhook(req.body, signature);

      // Process the event if signature is valid
      res.status(200).send({ recived: true });
      return { received: true }; // Respond with acknowledgment
    } catch (err) {
      //console.log('Webhook signature verification failed:', err.message);
      throw new UnauthorizedException('Invalid Stripe signature');
    }
  }
}
