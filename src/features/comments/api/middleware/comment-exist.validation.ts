import { NextFunction, Request, Response } from 'express';
import { HttpStatus, IdType } from '../../../../core';
import { container } from '../../../../composition-root';
import { CommentsQueryRepository } from '../../repositories/comments.query-repository';

export async function commentExistValidation(
  req: Request<IdType>,
  res: Response,
  next: NextFunction,
) {
  const commentsQueryRepository = container.get(CommentsQueryRepository);
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
