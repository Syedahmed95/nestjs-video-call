import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import {peerConnection} from "./web_sockets/web.peerjs";
import { ConfigModule } from "@nestjs/config";
const fs = require("fs")

async function bootstrap() {
  // const privateFile = join(__dirname,"..","private.pem"),
  //   publicFile = join(__dirname,"..","public.pem")
  // const httpsOptions = {
  //   key: fs.readFileSync(privateFile),
  //   cert: fs.readFileSync(publicFile),
  // };
  ConfigModule.forRoot()
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors()
  app.useStaticAssets(join(__dirname,"..",'static'))
  const PORT = await app.listen(process.env.PORT || 3000);
  console.log(`Application is running on ${await app.getUrl()}`)
  peerConnection(app)
}
bootstrap();
