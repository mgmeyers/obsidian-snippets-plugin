const runner = require('../runner');

test('runs echo', () => {
    const lang = 'shell'
    const content = `
echo hello world
            `
    expect(runner(lang, content)).toBe('hello world');
});


