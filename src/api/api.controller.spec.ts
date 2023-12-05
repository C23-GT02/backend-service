import { Test, TestingModule } from '@nestjs/testing';
import { ApiController } from './api.controller';
import { LoginService } from 'src/auth/login.service';
import { RegisterService } from 'src/auth/register.service';
import { FirestoreService } from 'src/services/firestore.service';
import { DashboardAdminService } from 'src/dashboard-admin/dashboard-admin.service';
import { ApiService } from './api.service';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';
import { LoginUserModel } from 'src/models/login.model';

describe('ApiController', () => {
  let controller: ApiController;
  let loginService: LoginService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiController],
      providers: [
        LoginService,
        RegisterService,
        FirestoreService,
        DashboardAdminService,
        ApiService,
      ],
    }).compile();

    controller = module.get<ApiController>(ApiController);
    loginService = module.get<LoginService>(LoginService);
  });

  describe('LoginUser', () => {
    it('should return success on successful authentication', async () => {
      const body: LoginUserModel = {
        email: 'gugugu@gmail.com',
        password: 'ukasyah',
      };

      const responseMock = {
        cookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      jest.spyOn(loginService, 'handleAuthentication').mockResolvedValue({
        data: 'mockedData',
        sessionCookie: 'mockedSessionCookie',
      });

      await controller.LoginUser(body, responseMock);

      expect(responseMock.cookie).toHaveBeenCalledWith(
        'id',
        'mockedData',
        expect.any(Object),
      );
      expect(responseMock.cookie).toHaveBeenCalledWith(
        'session',
        'mockedSessionCookie',
        expect.any(Object),
      );
      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(responseMock.send).toHaveBeenCalledWith({
        data: 'mockedData',
        sessionCookie: 'mockedSessionCookie',
      });
    });

    it('should return Unauthorized on authentication failure', async () => {
      const body: LoginUserModel = {
        email: 'gugugu@gmail.com',
        password: 'ukasyah',
      };

      const responseMock = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      jest
        .spyOn(loginService, 'handleAuthentication')
        .mockRejectedValue(new Error('Authentication failed'));

      await expect(
        controller.LoginUser(body, responseMock),
      ).rejects.toThrowError('Authentication failed');

      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(responseMock.send).toHaveBeenCalledWith('Authentication failed');
    });
  });

  // Add more test cases for other methods in ApiController

  afterEach(() => {
    jest.resetAllMocks();
  });
});
