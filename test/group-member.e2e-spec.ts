import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

let accessToken = null;
let groupId = null;
let memberId = null;

describe('GroupMemberController (e2e)', () => {
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
    //멤버 id
    const res3 = await request(app.getHttpServer())
      .get('/members')
      .set('authorization', 'bearer ' + accessToken);
    memberId = res3.body.data.memberList[0].id;
  });

  describe('그룹 멤버 API 테스트', () => {
    describe('그룹에 멤버 추가', () => {
      it('그룹에 멤버 추가 성공 201 /groups/:groupId/members/:memberId (POST)', async () => {
        const res = await request(app.getHttpServer())
          .post(`/groups/${groupId}/members/${memberId}`)
          .set('authorization', 'bearer ' + accessToken);

        expect(res.statusCode).toBe(201);
        return;
      });

      it('그룹에 멤버 추가 실패 401 /groups/:groupId/members/:memberId (POST)', async () => {
        const res = await request(app.getHttpServer())
          .post(`/groups/${groupId}/members/${memberId}`)
          .set('authorization', 'bearer ' + '1234');

        expect(res.statusCode).toBe(401);
        return;
      });

      it('그룹에 멤버 추가 실패 403 /groups/:groupId/members/:memberId (POST)', async () => {
        const res = await request(app.getHttpServer())
          .post(`/groups/${groupId}/members/1000000`)
          .set('authorization', 'bearer ' + accessToken);

        expect(res.statusCode).toBe(403);
        return;
      });

      it('그룹에 멤버 추가 실패 409 /groups/:groupId/members/:memberId (POST)', async () => {
        const res = await request(app.getHttpServer())
          .post(`/groups/${groupId}/members/${memberId}`)
          .set('authorization', 'bearer ' + accessToken);

        expect(res.statusCode).toBe(409);
        return;
      });
    });

    describe('그룹별 멤버 리스트', () => {
      it('그룹별 멤버 리스트 성공 200 /groups/:groupId/members (GET)', async () => {
        const res = await request(app.getHttpServer())
          .get(`/groups/${groupId}/members?size=10&page=0`)
          .set('authorization', 'bearer ' + accessToken);

        expect(res.statusCode).toBe(200);
        expect(res.body.data).toHaveProperty('group');
        expect(res.body.data).toHaveProperty('members');
        return;
      });

      it('그룹별 멤버 리스트 실패 401 /groups/:groupId/members (GET)', async () => {
        const res = await request(app.getHttpServer())
          .get(`/groups/${groupId}/members?size=10&page=0`)
          .set('authorization', 'bearer ' + '1234');

        expect(res.statusCode).toBe(401);
        return;
      });

      it('그룹별 멤버 리스트 실패 403 /groups/:groupId/members (GET)', async () => {
        const res = await request(app.getHttpServer())
          .get(`/groups/10000000/members?size=10&page=0`)
          .set('authorization', 'bearer ' + accessToken);

        expect(res.statusCode).toBe(403);
        return;
      });
    });

    describe('그룹에서 멤버 제거', () => {
      it('그룹에서 멤버 제거 성공 200 /groups/:groupId/members/:memberId (DELETE)', async () => {
        const res = await request(app.getHttpServer())
          .delete(`/groups/${groupId}/members/${memberId}`)
          .set('authorization', 'bearer ' + accessToken);

        expect(res.statusCode).toBe(200);
        return;
      });

      it('그룹에서 멤버 제거 실패 401 /groups/:groupId/members/:memberId (DELETE)', async () => {
        const res = await request(app.getHttpServer())
          .delete(`/groups/${groupId}/members/${memberId}`)
          .set('authorization', 'bearer ' + '1234');

        expect(res.statusCode).toBe(401);
        return;
      });

      it('그룹에서 멤버 제거 실패 403 /groups/:groupId/members/:memberId (DELETE)', async () => {
        const res = await request(app.getHttpServer())
          .post(`/groups/${groupId}/members/1000000`)
          .set('authorization', 'bearer ' + accessToken);

        expect(res.statusCode).toBe(403);
        return;
      });
    });
  });
});
