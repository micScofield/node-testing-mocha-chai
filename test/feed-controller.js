const expect = require('chai').expect
const sinon = require('sinon')
const mongoose = require('mongoose')

const User = require('../models/user')
const FeedController = require('../controllers/feed')
const config = require('../config.json')

describe('Feed Controller', function () {
    before(async () => {
        await mongoose.connect(`${config.URI}`, { useNewUrlParser: true, useUnifiedTopology: true })

        const newUser = await User.create({
            email: 'a@a.com',
            password: 'a@a.com',
            name: 'Sanyam',
            posts: [],
            _id: mongoose.Types.ObjectId('aaaaaaaaaaaa')
        })

        await newUser.save()
    })

    it('should add a created post to the posts of the creator', async () => {
        const req = {
            body: {
                title: 'Test Post',
                content: 'A Test Post'
            },
            file: {
                path: 'abc'
            },
            userId: 'aaaaaaaaaaaa'
        }
        const res = {
            status: function () {
                return this
            },
            json: function () { }
        }

        const savedUser = await FeedController.createPost(req, res, () => { })

        expect(savedUser).to.have.property('posts')
        expect(savedUser.posts).to.have.length(1)
    })

    after(async () => {
        //remove user from test database
        await User.findByIdAndDelete('aaaaaaaaaaaa')
        mongoose.disconnect()
    })
})
