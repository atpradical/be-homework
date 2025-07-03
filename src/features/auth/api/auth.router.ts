import { Router } from 'express';
import { loginHandler } from './handlers/login-handler';
import { inputValidationResultMiddleware } from '../../../core';
import { authInputValidation } from './middleware/auth.input-dto.validation';
import { accessTokenGuard } from './guards/access-token.guard';
import { meHandler } from './handlers/me.handler';

export const authRouter = Router({});

authRouter.post('/login', authInputValidation, inputValidationResultMiddleware, loginHandler);

authRouter.get('/me', accessTokenGuard, meHandler);
