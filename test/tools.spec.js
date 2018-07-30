const expect = require('chai').expect;
const tools = require('../src/tools');

describe('Tools', function () {
    it('is between hours, no day wrap in window', () => {
        expect(tools.isBetweenHours(16, 15, 17)).to.eql(true);
        expect(tools.isBetweenHours(14, 15, 17)).to.eql(false);
        expect(tools.isBetweenHours(19, 15, 17)).to.eql(false);
    });
    it('is between hours, with day wrap in window', () => {
        expect(tools.isBetweenHours(23, 22, 4)).to.eql(true);
        expect(tools.isBetweenHours(2, 22, 4)).to.eql(true);
        expect(tools.isBetweenHours(6, 22, 4)).to.eql(false);
    });
})