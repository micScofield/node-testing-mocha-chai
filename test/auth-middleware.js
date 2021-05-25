const jwt = require('jsonwebtoken')
const sinon = require('sinon')
const expect = require('chai').expect

const authMiddleware = require('../middleware/is-auth')

//Here is the code we wanna test (from auth middleware)
/*
(req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    const error = new Error('Not authenticated.');
    error.statusCode = 401;
    throw error;
    }
*/

//below is an example of an unit test
describe('Auth Middleware', () => {
    it('should throw an error if no authorization header is present', () => {
        //we need a dummy request object because we can create different scenarios
        const req = {
            get: () => null
        }

        // expect(authMiddleware(req, {}, () => {})).to.throw('Not authenticated.') 
        //do not call directly as it would not simulate testing env and instead we will get error in console

        //Passing a reference to the prepared test case method.
        expect(authMiddleware.bind(this, req, {}, () => { })).to.throw('Not authenticated.')
    })

    describe('Auth Middleware: nested test cases', () => {
        it('should throw an error if authorization header is only one string', () => {
            const req = {
                get: () => 'some_auth_header'
            }
            expect(authMiddleware.bind(this, req, {}, () => {})).to.throw()
        })
    })

    // WE SHOULD NOT TEST EXTERNAL DEPENDENCIES LIKE BELOW BECAUSE WE CANT TEST VERIFY/SIGN METHODS AS THEY ARE NOT OWNED BY US--

    // it('should throw an error if decoded token cant be verified', () => {
    //     const req = {
    //         get: () => 'Authorization SomeToken'
    //     }
    //     expect(authMiddleware.bind(this, req, {}, () => {})).to.throw() 
    // })


    // BELOW THROWS A JWT MALFORMED ERROR AS TOKEN IS NOT VERIFIED AND TEST FAILS THERE ITSELF

    // it('should yield a userId after decoding the token', () => {
    //     const req = {
    //         get: () => 'Authorization SomeToken'
    //     }
    //     authMiddleware(req, {}, () => {}) 
    //     expect(req).to.have.property('userId')
    // })

    //Change behavior of jwt verify
    /*
    it('should yield a userId after decoding the token', () => {
        const req = {
            get: () => 'Authorization SomeToken'
        }

        jwt.verify = () => {
            return {  }
        }

        authMiddleware(req, {}, () => {}) 
        expect(req).to.have.property('userId')
    })

    --> There is a huge downside of this approach because I am manually overriding verify methodology. This will override for all test cases and if I put this test in the first place, we may not get expected results for other test cases. So the middleware never throws any error anymore as verify method is compromised globally.
    WE NEED TO SOMEHOW RESTORE THAT FUNCTIONALITY -> SINON is the option
    */


    //Using Sinon stubs:

    it('should yield a userId after decoding the token', () => {
        const req = {
            get: () => 'Authorization SomeToken'
        }

        sinon.stub(jwt, 'verify')
        jwt.verify.returns({ userId: 'xyz' })

        authMiddleware(req, {}, () => {}) 
        expect(req).to.have.property('userId', 'xyz')

        //to check whether that function is called or not
        expect(jwt.verify.called).to.be.true

        //restore verify functionality as it was before
        jwt.verify.restore()
    })
})
