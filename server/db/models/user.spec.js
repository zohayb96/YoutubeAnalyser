const { expect } = require('chai')
const db = require('../index')
const User = db.model('user')

describe('User model', () => {
  beforeEach(() => {
    return db.sync({ force: true })
  })

  describe('instanceMethods', () => {
    describe('correctPassword', () => {
      let user;

      beforeEach(async () => {
        user = await User.create({
          username: 'zohaybshaikh',
          password: 'supersecurepassword'
        })
      })

      it('returns true if the password is correct', () => {
        expect(user.correctPassword('supersecurepassword')).to.be.equal(true)
      })

      it('returns false if the password is incorrect', () => {
        expect(user.correctPassword('notsecurepassword')).to.be.equal(false)
      })

    })
  })
})
describe('User Model Tests', () => {
  describe('User model', () => {
    describe('Validations', () => {
      it('requires username', async () => {
        const user = User.build()

        try {
          await user.validate()
          throw Error(
            'validation was successful but should have failed without `username`'
          )
        } catch (err) {
          expect(err.message).to.contain('username cannot be null')
        }
      })
      it('requires password', async () => {
        const user = User.build()
        try {
          await user.validate()
          throw Error(
            'validation was successful but should have failed without `password`'
          )
        } catch (err) {
          expect(err.message).to.contain('password cannot be null')
        }
      })
    })
  })
})
