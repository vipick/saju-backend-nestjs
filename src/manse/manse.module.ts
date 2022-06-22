import { Module } from '@nestjs/common';
import { ManseService } from './manse.service';
import { ManseController } from './manse.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { Member } from 'src/entities/member.entity';
import { Manse } from 'src/entities/manse.entity';
import { MemberManse } from 'src/entities/member-manse.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([Member, Manse, MemberManse]),
  ],
  controllers: [ManseController],
  providers: [ManseService],
})
export class ManseModule {}
