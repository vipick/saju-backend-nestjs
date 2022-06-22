import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

let accessToken = null;
let groupId = null;

describe('GroupController (e2e)', () => {
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
    //그룹 id
    const res2 = await request(app.getHttpServer())
      .get('/groups?size=10&page=0')
      .set('authorization', 'bearer ' + accessToken);
    groupId = res2.body.data.groupList[0].id;
  });

  describe('그룹 API 테스트', () => {
    describe('그룹 추가', () => {
      it('그룹 추가 성공 201 /groups (POST)', async () => {
        const res = await request(app.getHttpServer())
          .post('/groups')
          .send({
            name: 'test',
          })
          .set('authorization', 'bearer ' + accessToken);

        expect(res.statusCode).toBe(201);
        return;
      });

      it('그룹 추가 실패 400 /members (POST)', async () => {
        const res = await request(app.getHttpServer())
          .post('/groups')
          .send({
            name: 'test11111111111111111111111111111111111111111',
          })
          .set('authorization', 'bearer ' + accessToken);

        expect(res.statusCode).toBe(400);
        return;
      });

      it('그룹 추가 실패 401 /members (POST)', async () => {
        const res = await request(app.getHttpServer())
          .post('/groups')
          .send({
            name: 'test',
          })
          .set('authorization', 'bearer ' + '1234');

        expect(res.statusCode).toBe(401);
        return;
      });
    });

    describe('그룹 리스트', () => {
      it('그룹 리스트 성공 200 /groups (GET)', async () => {
        const res = await request(app.getHttpServer())
          .get('/groups?size=10&page=0')
          .set('authorization', 'bearer ' + accessToken);

        expect(res.statusCode).toBe(200);
        expect(res.body.data).toHaveProperty('totalItems');
        expect(res.body.data).toHaveProperty('totalPages');
        expect(res.body.data).toHaveProperty('currentPage');
        expect(res.body.data).toHaveProperty('groupList');
        return;
      });

      it('그룹 리스트 실패 401 /groups (GET)', async () => {
        const res = await request(app.getHttpServer())
          .get('/groups?size=10&page=0')
          .set('authorization', 'bearer ' + '1234');

        expect(res.statusCode).toBe(401);
        return;
      });
    });

    describe('그룹 수정', () => {
      it('그룹 수정 성공 200 /groups/:id (PATCH)', async () => {
        const res = await request(app.getHttpServer())
          .patch(`/groups/${groupId}`)
          .send({
            name: 'test11111',
          })
          .set('authorization', 'bearer ' + accessToken);

        expect(res.statusCode).toBe(200);
        return;
      });

      it('그룹 수정 실패 400 /groups/:id (PATCH)', async () => {
        const res = await request(app.getHttpServer())
          .patch(`/groups/${groupId}`)
          .send({
            name: 'test11111111111111111111111111111111111111111',
          })
          .set('authorization', 'bearer ' + accessToken);

        expect(res.statusCode).toBe(400);
        return;
      });

      it('그룹 수정 실패 401 /groups/:id (PATCH)', async () => {
        const res = await request(app.getHttpServer())
          .patch(`/groups/${groupId}`)
          .send({
            name: 'test11111',
          })
          .set('authorization', 'bearer ' + '1234');

        expect(res.statusCode).toBe(401);
        return;
      });

      it('그룹 수정 실패 403 /groups/:id (PATCH)', async () => {
        const res = await request(app.getHttpServer())
          .patch(`/groups/100000`)
          .send({
            name: 'test11111',
          })
          .set('authorization', 'bearer ' + accessToken);

        expect(res.statusCode).toBe(403);
        return;
      });
    });

    describe('그룹 삭제', () => {
      it('그룹 삭제 성공 200 /groups/:id (DELETE)', async () => {
        const res = await request(app.getHttpServer())
          .delete(`/groups/${groupId}`)
          .set('authorization', 'bearer ' + accessToken);

        expect(res.statusCode).toBe(200);
        return;
      });

      it('그룹 삭제 실패 401 /groups/:id (DELETE)', async () => {
        const res = await request(app.getHttpServer())
          .delete(`/groups/${groupId}`)
          .set('authorization', 'bearer ' + '1234');

        expect(res.statusCode).toBe(401);
        return;
      });

      it('그룹 삭제 실패 403 /groups/:id (DELETE)', async () => {
        const res = await request(app.getHttpServer())
          .delete(`/groups/100000`)
          .set('authorization', 'bearer ' + accessToken);

        expect(res.statusCode).toBe(403);
        return;
      });
    });

    describe('그룹명 리스트', () => {
      it('그룹명 리스트 성공 200 /groups/names (GET)', async () => {
        const res = await request(app.getHttpServer())
          .get('/groups/names')
          .set('authorization', 'bearer ' + accessToken);

        expect(res.statusCode).toBe(200);
        expect.arrayContaining(res.body.data);

        return;
      });

      it('그룹명 리스트 실패 401 /groups/names (GET)', async () => {
        const res = await request(app.getHttpServer())
          .get('/groups/names')
          .set('authorization', 'bearer ' + '1234');

        expect(res.statusCode).toBe(401);
        return;
      });
    });
  });
});
