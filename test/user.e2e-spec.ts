import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

let accessToken = null;
let email = null;

describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    const res = await request(app.getHttpServer()).post('/users/signin').send({
      email: 'test22@test.com',
      password: '1234',
    });
    accessToken = res.body.data.accessToken;
  });

  describe('회원 API 테스트', () => {
    describe('회원가입', () => {
      it('회원가입 성공 201 /users/signup (POST)', async () => {
        email = String(Math.floor(Math.random() * 10000000)) + 'test@test.com';
        const res = await request(app.getHttpServer())
          .post('/users/signup')
          .send({
            email: email,
            password: '1234',
            nickname: 'koo',
            birthdayType: 'SOLAR',
            gender: 'MALE',
            birthday: '19870213',
            time: '0710',
          });
        expect(res.statusCode).toBe(201);
        expect(res.body.data).toHaveProperty('accessToken');
        return;
      });

      it('회원가입 실패 400 /users/signup (POST)', async () => {
        const res = await request(app.getHttpServer())
          .post('/users/signup')
          .send({
            email: email,
            password: '1234',
            name: 'koo',
            birthdayType: 'SOLAR1',
            gender: 'MALE',
            birthday: '1987-02-13',
            time: '07:10',
          });
        expect(res.statusCode).toBe(400);
        return;
      });

      it('회원가입 실패 409 /users/signup (POST)', async () => {
        const res = await request(app.getHttpServer())
          .post('/users/signup')
          .send({
            email: email,
            password: '1234',
            name: 'koo',
            birthdayType: 'SOLAR1',
            gender: 'MALE',
            birthday: '1987-02-13',
            time: '07:10',
          });
        expect(res.statusCode).toBe(400);
        return;
      });
    });

    describe('로그인', () => {
      it('로그인 성공 200 /users/signin (POST)', async () => {
        const res = await request(app.getHttpServer())
          .post('/users/signin')
          .send({
            email: 'test22@test.com',
            password: '1234',
          });
        // accessToken = res.body.data.accessToken;

        expect(res.statusCode).toBe(200);
        expect(res.body.data).toHaveProperty('accessToken');
        return;
      });

      it('로그인 실패 400 /users/signin (POST)', async () => {
        const res = await request(app.getHttpServer())
          .post('/users/signin')
          .send({
            email: 'test',
            password: '1234',
          });

        expect(res.statusCode).toBe(400);
        return;
      });

      it('로그인 실패 401 /users/signin (POST)', async () => {
        const res = await request(app.getHttpServer())
          .post('/users/signin')
          .send({
            email: 'test@test.com',
            password: '12345',
          });

        expect(res.statusCode).toBe(401);
        return;
      });
    });

    describe('내 정보보기', () => {
      it('내 정보보기 성공 200 /users/me (GET)', async () => {
        const res = await request(app.getHttpServer())
          .get('/users/me')
          .set('authorization', 'bearer ' + accessToken);

        expect(res.statusCode).toBe(200);
        expect(res.body.data).toHaveProperty('member');
        expect(res.body.data).toHaveProperty('saju');
        return;
      });

      it('내 정보보기 실패 401 /users/me (GET)', async () => {
        const res = await request(app.getHttpServer())
          .get('/users/me')
          .set('authorization', 'bearer ' + '1234');

        expect(res.statusCode).toBe(401);
        return;
      });
    });
  });
});
