import { NextFunction, Request, Response } from 'express';
import { HttpStatus, IdType } from '../../../../core';
import { commentsQueryRepository } from '../../../../core/composition-root';

export async function commentExistValidation(
  req: Request<IdType>,
  res: Response,
  next: NextFunction,
) {
  const commentId = req.params.id;

  const comment = await commentsQueryRepository.findById(commentId);

  if (!comment) {
    res.status(HttpStatus.NotFound).send(`Comment with id:${commentId} not found`);
    return;
  }

  req.comment = comment;

  next();
  return;
}
