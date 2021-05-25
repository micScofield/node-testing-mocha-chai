const expect = require('chai').expect
const sinon = require('sinon')
const mongoose = require('mongoose')

const User = require('../models/user')
const AuthController = require('../controllers/auth')
const config = require('../config.json')

describe('Auth Controller - Login', () => {
    //check which status code applies 401 or 500 when db fails 
    it('should throw an error with code 500 when accessing database fails', async () => {
        sinon.stub(User, 'findOne')
        User.findOne.throws()

        const req = {
            body: {
                email: 'a@a.com',
                password: 'a@a.com'
            }
        }

        //We need to ensure we complete the operation and then finish the test. In promises, we should use done() method after test cases are asserted.
        /*
        AuthController.login(req, {}, () => {})
            .then(result => {
                console.log(result.statusCode)
                console.log(typeof result.statusCode)
                // expect(result).to.be.an('error')
                expect(result).to.have.property('statusCode', 501)
                done() //we can receive done as a parameter in it blocks cb function
            })
        */

        // Async await approach: Specify cb function of it block as async and await for response here. Easy Peasy.
        const result = await AuthController.login(req, {}, () => { })
        expect(result).to.have.property('statusCode', 500)

        User.findOne.restore()
    })

    //Approach 2. Testing Database
    /*
    describe('Auth Controller- GetStatus', () => {
        it('should return user data when finding user by id', async () => {
            //connect to testing database
            await mongoose.connect('mongodb+srv://sj:sj@cluster0.uwiom.mongodb.net/node-test-maximilian-testdb?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })

            const newUser = await User.create({
                email: 'a@a.com',
                password: 'a@a.com',
                name: 'Sanyam',
                posts: [],
                _id: mongoose.Types.ObjectId('qqqqqqqqqqqa')
            })

            await newUser.save()

            const req = {
                userId: 'qqqqqqqqqqqa'
            }

            const res = {
                statusCode: 500,
                userStatus: null,
                status: function (code) {
                    this.statusCode = code
                    return this
                },
                json: function (data) {
                    this.userStatus = data.status
                }
            }
            await AuthController.getUserStatus(req, res, () => { })
            expect(res.statusCode).to.be.equal(200)
            expect(res.userStatus).to.be.equal('I am new!')
        })
    })
    */

    // Using before each and after each

    describe('Auth Controller- GetStatus', () => {

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

        it('should return user data when finding user by id', async () => {
            //connect to testing database
            // await mongoose.connect(`${config.URI}`, { useNewUrlParser: true, useUnifiedTopology: true })

            const req = {
                userId: 'aaaaaaaaaaaa'
            }

            const res = {
                statusCode: 500,
                userStatus: null,
                status: function (code) {
                    this.statusCode = code
                    return this
                },
                json: function (data) {
                    this.userStatus = data.status
                }
            }
            await AuthController.getUserStatus(req, res, () => { })
            expect(res.statusCode).to.be.equal(200)
            expect(res.userStatus).to.be.equal('I am new!')
        })

        it('should update user status correctly', async () => {
            const req = {
                userId: 'aaaaaaaaaaaa',
                body: {
                    status: 'New status!'
                }
            }

            const res = {
                status: function() {
                    return this
                },
                json: function(data) {
                    this.userStatus = data.status
                }
            }
            await AuthController.updateUserStatus(req, res, () => { })
            expect(res.userStatus).to.be.equal('New status!')
        })

        after(async () => {
            //remove user from test database
            await User.findByIdAndDelete('aaaaaaaaaaaa')
            mongoose.disconnect()
        })
    })

})