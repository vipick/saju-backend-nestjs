import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

let accessToken = null;
let memberId = null;

describe('ManseController (e2e)', () => {
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

  describe('만세력 API 테스트', () => {
    describe('만세력 가져오기', () => {
      it('만세력 가져오기 성공 200 /manse/members/:id/fortune/:bigNum?/:smallNum? (GET)', async () => {
        const res = await request(app.getHttpServer())
          .get(`/manse/members/${memberId}/fortune`)
          .set('authorization', 'bearer ' + accessToken);

        expect(res.statusCode).toBe(200);
        expect(res.body.data).toHaveProperty('member');
        expect(res.body.data).toHaveProperty('saju');
        expect(res.body.data).toHaveProperty('fortune');
        expect(res.body.data).toHaveProperty('list');
        return;
      });

      it('만세력 가져오기 실패 401 /manse/members/:id/fortune/:bigNum?/:smallNum? (GET)', async () => {
        const res = await request(app.getHttpServer())
          .get(`/manse/members/${memberId}/fortune`)
          .set('authorization', 'bearer ' + '1234');

        expect(res.statusCode).toBe(401);
        return;
      });

      it('만세력 가져오기 실패 403 /manse/members/:id/fortune/:bigNum?/:smallNum? (GET)', async () => {
        const res = await request(app.getHttpServer())
          .get(`/manse/members/10000000/fortune`)
          .set('authorization', 'bearer ' + accessToken);

        expect(res.statusCode).toBe(403);
        return;
      });
    });
  });
});
