import {
  HttpStatus,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';

import { PrismaService } from 'src/prisma/prisma.service';
import { AppModule } from 'src/app.module';
import {
  SigninAuthDto,
  SignupAuthDto,
} from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import {
  CreateBookmarkDto,
  EditBookmarkDto,
} from 'src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // TODO: Starting logic of the e2e testing framework
  beforeAll(async () => {
    const moduleRef =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true }),
    );
    await app.init();
    await app.listen(3333);
    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl(
      'http://localhost:3333',
    );
  });

  // TODO: Finishing logic of the e2e testing framework
  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    describe('Signup', () => {
      const dto: SignupAuthDto = {
        email: 'thinura@dev.com',
        password: '123456',
      };
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ password: dto.password })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ email: dto.email })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should throw if no body provided', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(HttpStatus.CREATED);
      });
    });

    describe('Signin', () => {
      const dto: SigninAuthDto = {
        email: 'thinura@dev.com',
        password: '123456',
      };
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ password: dto.password })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ email: dto.email })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should throw if no body provided', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(HttpStatus.OK)
          .stores('userAt', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('should throw if request is not GET', () => {
        return pactum
          .spec()
          .post('/users/me')
          .expectStatus(HttpStatus.NOT_FOUND);
      });
      it('should throw if authorization token does not exist', () => {
        return pactum
          .spec()
          .get('/users/me')
          .expectStatus(HttpStatus.UNAUTHORIZED);
      });
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(HttpStatus.OK);
      });
    });

    describe('Edit user', () => {
      it('should edit user', () => {
        const dto: EditUserDto = {
          firstName: 'Vladimir',
          email: 'vlad@codewithvlad.com',
        };
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(HttpStatus.OK)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.email);
      });
    });
  });

  describe('Bookmarks', () => {
    describe('Get empty bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(HttpStatus.OK)
          .expectBody([]);
      });
    });

    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'First Bookmark',
        link: 'https://www.youtube.com/watch?v=d6WC5n9G_sM',
      };
      it('should create bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(HttpStatus.CREATED)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(HttpStatus.OK)
          .expectJsonLength(1);
      });
    });

    describe('Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(HttpStatus.OK)
          .expectBodyContains('$S{bookmarkId}');
      });
    });

    describe('Edit bookmark by id', () => {
      const dto: EditBookmarkDto = {
        title:
          'Kubernetes Course - Full Beginners Tutorial (Containerize Your Apps!)',
        description:
          'Learn how to use Kubernetes in this complete course. Kubernetes makes it possible to containerize applications and simplifies app deployment to production.',
      };
      it('should edit bookmark', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(HttpStatus.OK)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description);
      });
    });

    describe('Delete bookmark by id', () => {
      it('should delete bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(HttpStatus.NO_CONTENT);
      });

      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(HttpStatus.OK)
          .expectJsonLength(0);
      });
    });
  });
});
