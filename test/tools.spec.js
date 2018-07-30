const expect = require('chai').expect;
const tools = require('../src/tools');

describe('Tools', () => {
    it('isBetweenHours, no day wrap in window', () => {
        expect(tools.isBetweenHours(16, 15, 17)).to.eql(true);
        expect(tools.isBetweenHours(14, 15, 17)).to.eql(false);
        expect(tools.isBetweenHours(19, 15, 17)).to.eql(false);
    });
    it('isBetweenHours, with day wrap in window', () => {
        expect(tools.isBetweenHours(23, 22, 4)).to.eql(true);
        expect(tools.isBetweenHours(2, 22, 4)).to.eql(true);
        expect(tools.isBetweenHours(6, 22, 4)).to.eql(false);
    });
    it('msToTime', () => {
        expect(tools.msToTime((7 * 60 + 4) * 1000 + 222)).to.eql("7:04");
        expect(tools.msToTime((37 * 60 + 3) * 1000 + 555)).to.eql("37:04");
    });
    it('endsWith', () => {
        expect(tools.endsWith("bababababa", "ab")).to.eql(false);
        expect(tools.endsWith("bababababa", "a")).to.eql(true);
        expect(tools.endsWith("baba", "baba")).to.eql(true);
        expect(tools.endsWith("ba", "baba")).to.eql(false);
    });
    it('floatToStringWithMaxDecimals', () => {
        expect(tools.floatToStringWithMaxDecimals(123456.789, 2)).to.eql('123456.78');
        expect(tools.floatToStringWithMaxDecimals(123456, 2)).to.eql('123456');
    });
});