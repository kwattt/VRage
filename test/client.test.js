import {Client} from './../dist/client'

describe('Client tests', () => {
  it('should pass', () => {
    expect(true).toBe(true)
  })

  it('should create a new client', () => {
    Client.testFunction()

    expect(Client.testFunction).toHaveBeenCalled()
  })
})