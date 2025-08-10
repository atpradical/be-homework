import { Router } from 'express';
import { refreshTokenGuard } from '../../auth/api/guards/refresh-token.guard';
import { container } from '../../../composition-root';
import { SecurityDevicesSessionsController } from './security-devices-sessions.controller';

export const securityDevicesRouter = Router({});

const authDeviceSessionController = container.get(SecurityDevicesSessionsController);

securityDevicesRouter
  .get(
    '/',
    refreshTokenGuard,
    authDeviceSessionController.getSecurityDeviceListHandler.bind(authDeviceSessionController),
  )
  .delete(
    '/',
    refreshTokenGuard,
    authDeviceSessionController.deleteAllSecurityDeviceSessionsHandler.bind(
      authDeviceSessionController,
    ),
  )
  .delete(
    '/:id',
    refreshTokenGuard,
    authDeviceSessionController.deleteSecurityDeviceSessionHandler.bind(
      authDeviceSessionController,
    ),
  );
