function extract(src, lineNumber) {

    function is(line, target) {
        let str = line.trim()
        return str.toUpperCase() === target.toUpperCase();
    }

    let lines = src.split('\n')
    let begin = null
    let end = null
    let lang = null

    for (let i = lineNumber; i >= 0; i--) {
        if (is(lines[i], '```shell')) {
            begin = i;
            lang = 'shell'
            break
        } else if (is(lines[i], '```python')) {
            begin = i;
            lang = 'python'
            break
        } else if (i !== lineNumber && is(lines[i], '```')) {
            begin = null
            lang = null
            break
        }
    }

    for (let i = lineNumber; i < lines.length; i++) {
        if (i !== begin && is(lines[i], '```')) {
            end = i;
            break
        }
    }

    if ((begin != null) && (end != null)) {
        return {
            lang: lang,
            text: lines.slice(begin + 1, end).join('\n'),
            begin: begin,
            end: end,
        };
    }
    return null

}

module.exports = extract;
