import request from "supertest";
import {HTTP_STATUSES, likesStatuses} from "../src/utils";
import {app} from "../src/app";
import {OutputPostType} from "../src/types/post/output";
import {OutputBlogType} from "../src/types/blog/output";
import {OutputUserType} from "../src/types/user/output";
import {OutputCommentType} from "../src/types/comment/output";
import mongoose from "mongoose";

const login = 'admin'
const password = 'qwerty'

describe('/comments', () => {
    const dbName = 'Tests'
    const mongoURI = process.env.MONGO_URL || 'mongodb://0.0.0.0:27017'

    beforeAll(async () => {
        await mongoose.connect(mongoURI, {dbName: dbName})
    })

    afterAll(async () => {
        await mongoose.connection.close()
    })

    let newUser1: OutputUserType | null = null
    let newUser2: OutputUserType | null = null
    let token1: any = null
    let token2: any = null
    let newPost: OutputPostType | null = null
    let newBlog: OutputBlogType | null = null
    let newComment: OutputCommentType | null = null

    // DELETE ALL DATA
    beforeAll(async() => {
        await request(app)
            .delete('/testing/all-data')
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })

    // CREATE NEW USERS
    it('+ POST create user1 with correct data', async () => {
        const createUser = await request(app)
            .post('/users')
            .auth(login, password)
            .send({
                login: 'login',
                password: '123456',
                email: 'test@test.com'
            })
            .expect(HTTP_STATUSES.CREATED_201)

        newUser1 = createUser.body

        expect(newUser1).toEqual({
            id: expect.any(String),
            login: 'login',
            email: 'test@test.com',
            createdAt: expect.any(String)
        })

        await request(app)
            .get('/users')
            .auth(login, password)
            .expect(HTTP_STATUSES.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [newUser1]
            })
    })

    it('+ POST create user2 with correct data', async () => {
        const createUser = await request(app)
            .post('/users')
            .auth(login, password)
            .send({
                login: 'FakeUser',
                password: '654321',
                email: 'user@fake.com'
            })
            .expect(HTTP_STATUSES.CREATED_201)

        newUser2 = createUser.body

        expect(newUser2).toEqual({
            id: expect.any(String),
            login: 'FakeUser',
            email: 'user@fake.com',
            createdAt: expect.any(String)
        })

        await request(app)
            .get('/users')
            .auth(login, password)
            .expect(HTTP_STATUSES.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 2,
                items: [newUser1, newUser2]
            })
    })

    // CREATE NEW BLOG
    it('+ POST create blog with correct data)', async () => {
        const createBlog = await request(app)
            .post('/blogs')
            .auth(login, password)
            .send({name: 'New blog 1', description: 'New description 1', websiteUrl: 'https://website1.com'})
            .expect(HTTP_STATUSES.CREATED_201)

        newBlog = createBlog.body

        expect(newBlog).toEqual({
            id: expect.any(String),
            name: 'New blog 1',
            description: 'New description 1',
            websiteUrl: 'https://website1.com',
            createdAt: expect.any(String),
            isMembership: false
        })

        await request(app)
            .get('/blogs')
            .expect(HTTP_STATUSES.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [newBlog]
            })
    })

    // CREATE NEW POST
    it('+ POST create post with correct data)', async () => {
        const createPost = await request(app)
            .post('/posts')
            .auth(login, password)
            .send({title: 'New post 1', shortDescription: 'New shortDescription 1', content: 'New content 1', blogId: newBlog!.id})
            .expect(HTTP_STATUSES.CREATED_201)

        newPost = createPost.body

        expect(newPost).toEqual({
            id: expect.any(String),
            title: 'New post 1',
            shortDescription: 'New shortDescription 1',
            content: 'New content 1',
            blogId: expect.any(String),
            blogName: expect.any(String),
            createdAt: expect.any(String)
        })

        await request(app)
            .get('/posts')
            .expect(HTTP_STATUSES.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [newPost]
            })
    })

    // CHECK USER AND CREATE TOKEN (JWT)
    it('+ POST enter to system with correct data and create token1', async () => {
        const createToken = await request(app)
            .post('/auth/login')
            .send({
                loginOrEmail: 'test@test.com',
                password: '123456'
            })
            .expect(HTTP_STATUSES.OK_200)

        token1 = createToken.body.accessToken
    })

    it('+ POST enter to system with correct data and create token2', async () => {
        const createToken = await request(app)
            .post('/auth/login')
            .send({
                loginOrEmail: 'user@fake.com',
                password: '654321'
            })
            .expect(HTTP_STATUSES.OK_200)

        token2 = createToken.body.accessToken
    })

    // CREATE COMMENT FOR POST
    it('+ POST create comment for post with correct token and data', async() => {
        const createComment = await request(app)
            .post(`/posts/${newPost!.id}/comments`)
            .set('Authorization', `Bearer ${token1}`)
            .send({content: 'new content for post user\'s'})
            .expect(HTTP_STATUSES.CREATED_201)

        newComment = createComment.body

        expect(newComment).toEqual({
            id: expect.any(String),
            content: 'new content for post user\'s',
            commentatorInfo: {
                userId: `${newUser1!.id}`,
                userLogin: `${newUser1!.login}`
            },
            createdAt: expect.any(String),
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: likesStatuses.none
            }
        })

        await request(app)
            .get(`/posts/${newPost!.id}/comments`)
            .expect(HTTP_STATUSES.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [newComment]
            })
    })

    // CHECK PUT LIKES COMMENTS
    it('- PUT change like status comment for user with incorrect status', async() => {
        await request(app)
            .put(`/comments/${newComment!.id}/like-status`)
            .set('Authorization', `Bearer ${token1}`)
            .send({
                likeStatus: 'badStatus'
            })
            .expect(HTTP_STATUSES.BAD_REQUEST_400)
    })

    it('+ PUT change like status comment for user with correct data', async() => {
        await request(app)
            .put(`/comments/${newComment!.id}/like-status`)
            .set('Authorization', `Bearer ${token1}`)
            .send({
                likeStatus: likesStatuses.none
            })
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await request(app)
            .get(`/comments/${newComment!.id}`)
            .set('Authorization', `Bearer ${token1}`)
            .expect(HTTP_STATUSES.OK_200, {
                ...newComment,
                commentatorInfo: {...newComment!.commentatorInfo},
                likesInfo: {
                    ...newComment!.likesInfo,
                    myStatus: likesStatuses.none
                }
            })

        await request(app)
            .put(`/comments/${newComment!.id}/like-status`)
            .set('Authorization', `Bearer ${token1}`)
            .send({
                likeStatus: likesStatuses.like
            })
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await request(app)
            .get(`/comments/${newComment!.id}`)
            .set('Authorization', `Bearer ${token1}`)
            .expect(HTTP_STATUSES.OK_200, {
                ...newComment,
                commentatorInfo: {...newComment!.commentatorInfo},
                likesInfo: {
                    ...newComment!.likesInfo,
                    likesCount: 1,
                    myStatus: likesStatuses.like
                }
            })

        await request(app)
            .put(`/comments/${newComment!.id}/like-status`)
            .set('Authorization', `Bearer ${token1}`)
            .send({
                likeStatus: likesStatuses.dislike
            })
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await request(app)
            .get(`/comments/${newComment!.id}`)
            .set('Authorization', `Bearer ${token1}`)
            .expect(HTTP_STATUSES.OK_200, {
                ...newComment,
                commentatorInfo: {...newComment!.commentatorInfo},
                likesInfo: {
                    ...newComment!.likesInfo,
                    likesCount: 0,
                    dislikesCount: 1,
                    myStatus: likesStatuses.dislike
                }
            })

        await request(app)
            .put(`/comments/${newComment!.id}/like-status`)
            .set('Authorization', `Bearer ${token1}`)
            .send({
                likeStatus: likesStatuses.dislike
            })
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await request(app)
            .get(`/comments/${newComment!.id}`)
            .set('Authorization', `Bearer ${token1}`)
            .expect(HTTP_STATUSES.OK_200, {
                ...newComment,
                commentatorInfo: {...newComment!.commentatorInfo},
                likesInfo: {
                    ...newComment!.likesInfo,
                    likesCount: 0,
                    dislikesCount: 1,
                    myStatus: likesStatuses.dislike
                }
            })
    })

    it('+ PUT change like status comment for other user with correct data', async() => {
        await request(app)
            .put(`/comments/${newComment!.id}/like-status`)
            .set('Authorization', `Bearer ${token2}`)
            .send({
                likeStatus: likesStatuses.none
            })
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await request(app)
            .get(`/comments/${newComment!.id}`)
            .set('Authorization', `Bearer ${token2}`)
            .expect(HTTP_STATUSES.OK_200, {
                ...newComment,
                commentatorInfo: {...newComment!.commentatorInfo},
                likesInfo: {
                    ...newComment!.likesInfo,
                    likesCount: 0,
                    dislikesCount: 1,
                    myStatus: likesStatuses.none
                }
            })

        await request(app)
            .put(`/comments/${newComment!.id}/like-status`)
            .set('Authorization', `Bearer ${token2}`)
            .send({
                likeStatus: likesStatuses.like
            })
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await request(app)
            .get(`/comments/${newComment!.id}`)
            .set('Authorization', `Bearer ${token2}`)
            .expect(HTTP_STATUSES.OK_200, {
                ...newComment,
                commentatorInfo: {...newComment!.commentatorInfo},
                likesInfo: {
                    ...newComment!.likesInfo,
                    likesCount: 1,
                    dislikesCount: 1,
                    myStatus: likesStatuses.like
                }
            })

        await request(app)
            .put(`/comments/${newComment!.id}/like-status`)
            .set('Authorization', `Bearer ${token2}`)
            .send({
                likeStatus: likesStatuses.dislike
            })
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await request(app)
            .get(`/comments/${newComment!.id}`)
            .set('Authorization', `Bearer ${token2}`)
            .expect(HTTP_STATUSES.OK_200, {
                ...newComment,
                commentatorInfo: {...newComment!.commentatorInfo},
                likesInfo: {
                    ...newComment!.likesInfo,
                    dislikesCount: 2,
                    myStatus: likesStatuses.dislike
                }
            })
    })

    // GET COMMENTS VISITOR
    it('+ GET comment for visitor with correct data', async() => {
        await request(app)
            .get(`/comments/${newComment!.id}`)
            .expect(HTTP_STATUSES.OK_200, {
                ...newComment,
                commentatorInfo: {...newComment!.commentatorInfo},
                likesInfo: {
                    ...newComment!.likesInfo,
                    likesCount: 0,
                    dislikesCount: 2,
                    myStatus: likesStatuses.none
                }
            })
    })

    it('+ GET all comments post\'s for visitor with correct data', async() => {
        await request(app)
            .get(`/posts/${newPost!.id}/comments`)
            .expect(HTTP_STATUSES.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [{
                    ...newComment,
                    commentatorInfo: {...newComment!.commentatorInfo},
                    likesInfo: {
                        ...newComment!.likesInfo,
                        likesCount: 0,
                        dislikesCount: 2,
                        myStatus: likesStatuses.none
                    }
                }]
            })
    })

    // DELETE ALL DATA
    afterAll(async() => {
        await request(app)
            .delete('/testing/all-data')
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })

})