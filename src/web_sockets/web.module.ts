import { Module } from '@nestjs/common';
import {WebConnection} from "./web.connection";

@Module({
    imports: [],
    controllers: [],
    providers: [WebConnection],
})
export class webModule {}
  