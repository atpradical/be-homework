import { Router } from 'express';
import { getSecurityDeviceListHandler } from '../handlers/get-security-device-list.handler';
import { refreshTokenGuard } from '../../auth/api/guards/refresh-token.guard';
import { deleteSecurityDeviceSessionHandler } from '../handlers/delete-security-device-session.handler';
import { deleteAllSecurityDeviceSessionsHandler } from '../handlers/delete-all-security-device-sessions.handler';

export const securityDevicesRouter = Router({});

securityDevicesRouter
  .get('/', refreshTokenGuard, getSecurityDeviceListHandler)
  .delete('/', refreshTokenGuard, deleteAllSecurityDeviceSessionsHandler)
  .delete('/:id', refreshTokenGuard, deleteSecurityDeviceSessionHandler);
