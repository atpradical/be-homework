import { Router } from 'express';
import { loginHandler } from '../handlers/login-handler';
import { inputValidationResultMiddleware } from '../../../core';
import { authInputValidation } from './auth.input-dto.validation-middleware';

export const authRouter = Router({});

authRouter.post(
  '/login',
  authInputValidation,
  inputValidationResultMiddleware,
  loginHandler,
);
