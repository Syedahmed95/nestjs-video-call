import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {webModule} from "./web_sockets/web.module"

@Module({
  imports: [webModule],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
