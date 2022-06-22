import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

let accessToken = null;
let memberId = null;

describe('MemberController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    //로그인 인증
    const res = await request(app.getHttpServer()).post('/users/signin').send({
      email: 'test22@test.com',
      password: '1234',
    });
    accessToken = res.body.data.accessToken;
    //멤버 id
    const res2 = await request(app.getHttpServer())
      .get('/members')
      .set('authorization', 'bearer ' + accessToken);
    memberId = res2.body.data.memberList[0].id;
  });

  describe('멤버 API 테스트', () => {
    describe('멤버 추가', () => {
      it('멤버 추가 성공 201 /members (POST)', async () => {
        const res = await request(app.getHttpServer())
          .post('/members')
          .send({
            nickname: 'test',
            gender: 'MALE',
            birthdayType: 'SOLAR',
            birthday: '19870213',
            time: '0710',
          })
          .set('authorization', 'bearer ' + accessToken);

        expect(res.statusCode).toBe(201);
        return;
      });

      it('멤버 추가 실패 400 /members (POST)', async () => {
        const res = await request(app.getHttpServer())
          .post('/members')
          .send({
            nickname: 'test',
            gender: 'MALE',
            birthdayType: 'SOLAR',
            birthday: '25000213',
            time: '0710',
          })
          .set('authorization', 'bearer ' + accessToken);

        expect(res.statusCode).toBe(400);
        return;
      });

      it('멤버 추가 실패 401 /members (POST)', async () => {
        const res = await request(app.getHttpServer())
          .post('/members')
          .send({
            nickname: 'test',
            gender: 'MALE',
            birthdayType: 'SOLAR',
            birthday: '19870213',
            time: '0710',
          })
          .set('authorization', 'bearer ' + '1234');

        expect(res.statusCode).toBe(401);
        return;
      });
    });

    describe('멤버 리스트', () => {
      it('멤버 리스트 성공 200 /members (GET)', async () => {
        const res = await request(app.getHttpServer())
          .get('/members?size=10&page=0')
          .set('authorization', 'bearer ' + accessToken);

        expect(res.statusCode).toBe(200);
        expect(res.body.data).toHaveProperty('totalItems');
        expect(res.body.data).toHaveProperty('totalPages');
        expect(res.body.data).toHaveProperty('currentPage');
        expect(res.body.data).toHaveProperty('memberList');
        return;
      });

      it('멤버 리스트 실패 401 /members (GET)', async () => {
        const res = await request(app.getHttpServer())
          .get('/members?size=10&page=0')
          .set('authorization', 'bearer ' + '1234');

        expect(res.statusCode).toBe(401);
        return;
      });
    });

    describe('멤버 삭제', () => {
      it('멤버 삭제 성공 200 /members/:id (DELETE)', async () => {
        const res = await request(app.getHttpServer())
          .delete(`/members/${memberId}`)
          .set('authorization', 'bearer ' + accessToken);

        expect(res.statusCode).toBe(200);
        return;
      });

      it('멤버 삭제 실패 401 /members/:id (DELETE)', async () => {
        const res = await request(app.getHttpServer())
          .delete(`/members/${memberId}`)
          .set('authorization', 'bearer ' + '1234');

        expect(res.statusCode).toBe(401);
        return;
      });

      it('멤버 삭제 실패 403 /members (DELETE)', async () => {
        const res = await request(app.getHttpServer())
          .delete(`/members/100000`)
          .set('authorization', 'bearer ' + accessToken);

        expect(res.statusCode).toBe(403);
        return;
      });
    });
  });
});
