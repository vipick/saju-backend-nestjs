import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { GroupMember } from 'src/entities/group-member.entity';
import { Group } from 'src/entities/group.entity';
import { Manse } from 'src/entities/manse.entity';
import { MemberManse } from 'src/entities/member-manse.entity';
import { Member } from 'src/entities/member.entity';
import { User } from 'src/entities/user.entity';

dotenv.config();
const entityArr = [User, Member, MemberManse, Manse, Group, GroupMember];

export let typeORMConfig: TypeOrmModuleOptions;
if (process.env.NODE_ENV === 'dev') {
  typeORMConfig = {
    type: 'mysql',
    host: process.env.DEV_DB_HOST,
    port: 3307,
    username: process.env.DEV_DB_USERNAME,
    password: process.env.DEV_DB_PASSWORD,
    database: process.env.DEV_DB_DATABASE,
    entities: entityArr,
    autoLoadEntities: true,
    synchronize: true,
    logging: false,
    keepConnectionAlive: true,
    timezone: '+09:00',
  };
} else if (process.env.NODE_ENV === 'test') {
  typeORMConfig = {
    type: 'mysql',
    host: process.env.TEST_DB_HOST,
    port: 3307,
    username: process.env.TEST_DB_USERNAME,
    password: process.env.TEST_DB_PASSWORD,
    database: process.env.TEST_DB_DATABASE,
    entities: entityArr,
    autoLoadEntities: true,
    synchronize: true,
    logging: false,
    keepConnectionAlive: true,
    timezone: '+09:00',
  };
} else {
  //production (prod)
  console.log('DB 연결 성공 : ', process.env.NODE_ENV);
  typeORMConfig = {
    type: 'mysql',
    host: process.env.PROD_DB_HOST,
    port: 3306,
    username: process.env.PROD_DB_USERNAME,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_DATABASE,
    // replication: {
    //   master: {
    //     host: process.env.PROD_DB_WRITER_HOST,
    //     port: 3306,
    //     username: process.env.PROD_DB_USERNAME,
    //     password: process.env.PROD_DB_PASSWORD,
    //     database: process.env.PROD_DB_DATABASE,
    //   },
    //   slaves: [
    //     {
    //       host: process.env.PROD_DB_READER_HOST,
    //       port: 3306,
    //       username: process.env.PROD_DB_USERNAME,
    //       password: process.env.PROD_DB_PASSWORD,
    //       database: process.env.PROD_DB_DATABASE,
    //     },
    //   ],
    // },
    entities: entityArr,
    autoLoadEntities: true,
    synchronize: false,
    logging: false,
    keepConnectionAlive: true,
    timezone: '+09:00',
  };
}
