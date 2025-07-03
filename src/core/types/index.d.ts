import {IdType} from './index'
import {WithId} from "mongodb";
import {CommentDB} from "../../features/comments/types";

declare global {
    declare namespace Express {
        export interface Request {
            user: IdType | undefined;
            comment: WithId<CommentDB> | undefined;
        }
    }
}