import {IdType, UserDetailsInRequest} from './index'
import {WithId} from "mongodb";
import {CommentDB} from "../../features/comments/types";

declare global {
    declare namespace Express {
        export interface Request {
            user: UserDetailsInRequest | undefined;
            comment: WithId<CommentDB> | undefined;
            refreshToken: string | undefined;
        }
    }
}