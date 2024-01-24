import {body} from "express-validator";
import {inputModelValidation} from "../inputModel/input-model-validation";
import {likesStatuses} from "../../utils";

const contentValidation = body('content')
    .isString()
    .trim()
    .isLength({min: 20, max: 300})
    .withMessage('Invalid content')

const likeStatusValidation = body('likeStatus')
    .isString()
    .trim()
    .isLength({min: 4})
    .withMessage('Invalid like status')
    .custom(async(likeStatus) => {
        if (likeStatus === likesStatuses.none ||
            likeStatus === likesStatuses.like ||
            likeStatus === likesStatuses.dislike) {
            return true
        } else {
            throw new Error('Invalid like status')
        }
    })

export const commentValidation = () => [contentValidation, inputModelValidation]
export const likeStatusForCommentValidation = () => [likeStatusValidation, inputModelValidation]