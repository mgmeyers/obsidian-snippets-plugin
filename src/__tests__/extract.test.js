const extract = require('../extract');

test('extracts code fence', () => {
    const src = `
\`\`\`python
print('Hello world')
\`\`\`

    `

    const hit = {
        "begin": 1,
        "end": 3,
        "lang": "python",
        "text": "print('Hello world')"
    }

    expect(extract(src, 0)).not.toBe(hit);
    expect(extract(src, 1)).toStrictEqual(hit);
    expect(extract(src, 2)).toStrictEqual(hit);
    expect(extract(src, 3)).toStrictEqual(hit);
    expect(extract(src, 4)).not.toBe(hit);
});


test('detects code', () => {
    let src = `0
1
# Miscelaneous 2 
3
\`\`\`shell
echo tango number 5
echo \n number 7
\`\`\`
9
## Other heading 10
11
Other text 12
    `

    let hit = {
        "begin": 4,
        "end": 8,
        "lang": "shell",
        "text": "echo tango number 5\necho \n number 7"
    }

    expect(extract(src, 2)).not.toBe('code');
    expect(extract(src, 3)).not.toBe('code');
    expect(extract(src, 4)).toStrictEqual(hit);
    expect(extract(src, 5)).toStrictEqual(hit);
    expect(extract(src, 6)).toStrictEqual(hit);
    expect(extract(src, 7)).toStrictEqual(hit);
    expect(extract(src, 8)).toStrictEqual(hit);
    expect(extract(src, 9)).not.toBe('code');
    expect(extract(src, 10)).not.toBe('code');

});

test('extracts python', () => {
    const src = `
\`\`\`python   
print('Hello world')
\`\`\`  Something else
    `


    expect(extract(src, 2)).toStrictEqual(null);
});


test('detects code', () => {

    let src = `\`\`\`python
var='I\\'m elegant you know...'
\`\`\`     

\`\`\`shell
echo don't mix us!
\`\`\` `

    const hit_1 = {
        "begin": 0,
        "end": 2,
        "lang": "python",
        "text": "var='I\\'m elegant you know...'"
    }

    const hit_2 = {
        "begin": 4,
        "end": 6,
        "lang": "shell",
        "text": "echo don't mix us!"
    }


    expect(extract(src, 0)).toStrictEqual(hit_1);
    expect(extract(src, 1)).toStrictEqual(hit_1);
    expect(extract(src, 2)).toStrictEqual(hit_1);
    expect(extract(src, 3)).toStrictEqual(null);
    expect(extract(src, 4)).toStrictEqual(hit_2);
    expect(extract(src, 5)).toStrictEqual(hit_2);
    expect(extract(src, 6)).toStrictEqual(hit_2);

});

